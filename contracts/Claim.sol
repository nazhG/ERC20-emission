//SPDX-License-Identifier: CAL
pragma solidity 0.6.12;

import {Math} from "@openzeppelin/contracts/math/Math.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {TierUtil} 
 from "@beehiveinnovation/rain-protocol/contracts/libraries/TierUtil.sol";
import {ERC20TransferTier} 
 from "@beehiveinnovation/rain-protocol/contracts/tier/ERC20TransferTier.sol";
import {ITier} 
 from "@beehiveinnovation/rain-protocol/contracts/tier/ITier.sol";
import {IClaim} from "./IClaim.sol";

/// @title Terra Virtua Rewards Minter
/// Allows minting a reward based on the time that the user has been in a tier.
///
/// The user could achieve a tier in an independent contract
/// based on the time the user has in that tier
/// a reward will be calculated based on 10% of the tier value over a year
/// also get the maximum bonus, a multiplier by 2 for 3 years of holding
/// for a maximum return of 20% per annum of the value of the tier
///
/// @dev `tierRewardValues` Returns the value of the block reward of the tier.
///
/// `getReward` Returns the current accumulated reward of `acount_`.
///
/// `claim` Claim the `msg.sender` reward.
contract Claim is ERC20, IClaim {
    using Math for uint256;
    using SafeMath for uint256;

    /// @dev Address of the `ValueTier` contract,
    ///  rewards per tier will be calculated from this contract,
    ///  and will be consulted to know the tier of the users.
    address immutable tierAddress;

    /// @dev Each one store the value of the reward per block of each tier.
    /// See `tierRewardValues`.
    uint256 private immutable rewardTierOne;
    uint256 private immutable rewardTierTwo;
    uint256 private immutable rewardTierThree;
    uint256 private immutable rewardTierFour;
    uint256 private immutable rewardTierFive;
    uint256 private immutable rewardTierSix;
    uint256 private immutable rewardTierSeven;
    uint256 private immutable rewardTierEight;

    /// @dev Number of blocks needed to reach the maximum reward multiplier.
    /// Seconds in 3 years divided by 2 (network difficulty).
    /// (365 days * 3) / 2 = 47304000 = number of blocks in three years.
    //  BLOCKS_TO_REACH_MAX_MULTIPLIER
    uint256 private constant BLOCKS_TO_REACH_MAX_MULTIPLIER = (365 days * 3)/2;

    /// @dev Number of blocks needed to get the base reward.
    /// base reward = 10% of the tier value in one year.
    /// Seconds in 1 year divided by 2 (network difficulty) and by 10%.
    /// 365 days / 20 = 1576800 = number of blocks in a year div by 10.
    uint256 private constant BLOCKS_TO_REACH_REWARD = 365 days / 20;

    /// @dev We use 8 decimal places to calculate the multiplier.
    uint256 private constant MULTIPLIER_DECIMALS = 1e8;

    /// @dev Maximum multiplier achievable for the calculation of the reward.
    uint256 private constant MAX_MULTIPLIER = 2 * MULTIPLIER_DECIMALS;

    /// @dev Store the block number when user claimed.
    mapping(address => uint256) lastClaim;

    /// Redeem successful reward.
    /// @param account Where the reward token was transfered.
    /// @param amount of reward token transfered.
    event RedeemReward(address indexed account, uint256 amount);

    /// Set the `tierRewardValues` as a reference of the immutable value.
    /// The reward is 10% of teh tier value along one year.
    /// So, the reward = tier_value * 10% / 15552000 (blocks in one year)
    constructor(address tierAddress_)
        public
        ERC20("TVP", "Terra Virtual Prestige")
    {
        require(tierAddress_ != address(0));
        tierAddress = tierAddress_;

        uint256[8] memory tierValues_ = ERC20TransferTier(tierAddress_)
            .tierValues();
        /// We divide each value of the tier 
        ///  by the number of blocks needed to obtain the reward,
        ///  to know how much reward each block that passes gives,
        ///  all blocks of a year are equivalent to 10% of tier value.
        rewardTierOne = tierValues_[0].div(BLOCKS_TO_REACH_REWARD);
        rewardTierTwo = tierValues_[1].div(BLOCKS_TO_REACH_REWARD);
        rewardTierThree = tierValues_[2].div(BLOCKS_TO_REACH_REWARD);
        rewardTierFour = tierValues_[3].div(BLOCKS_TO_REACH_REWARD);
        rewardTierFive = tierValues_[4].div(BLOCKS_TO_REACH_REWARD);
        rewardTierSix = tierValues_[5].div(BLOCKS_TO_REACH_REWARD);
        rewardTierSeven = tierValues_[6].div(BLOCKS_TO_REACH_REWARD);
        rewardTierEight = tierValues_[7].div(BLOCKS_TO_REACH_REWARD);
    }

    /// Indexed array with the rewards per block of each tier.
    /// @return tierValues_ The immutable `tierValues`.
    function tierRewardValues()
        internal
        view
        returns (uint256[8] memory tierValues_)
    {
        tierValues_ = [
            rewardTierOne,
            rewardTierTwo,
            rewardTierThree,
            rewardTierFour,
            rewardTierFive,
            rewardTierSix,
            rewardTierSeven,
            rewardTierEight
        ];
    }

    /// Calculates the reward based on the user's holding time and tier.
    /// @return reward_ amount of reclaimable tokens.
    function getReward(address account_)
        public
        view
        override
        returns (uint256 reward_)
    {
        uint256 report_ = ERC20TransferTier(tierAddress).report(account_);
        ITier.Tier userTier_ = TierUtil.tierAtBlockFromReport(
            report_,
            block.number
        );

        if (userTier_ <= ITier.Tier.ZERO) {
            return 0;
        }

        uint256 userJoinBlockNumber = TierUtil.tierBlock(report_, userTier_);

        // For the calculation of the holding days,
        // We use the number of the block in which the tier was joined
        // Unless you have already made a claim in that same tier.
        uint256 diffBlocksSinceInvest_ = (
            block.number.sub(
                lastClaim[account_].max(userJoinBlockNumber)
            )
        );

        // Multiplier can be up to a maximum of 2X after 3 years of holding.
        // Multiplier is always between 2 and 1.x.
        uint256 multiplier_ =
            // Here we calculate when less than 3 years have passed.
            // Add and divide the days by the maximum number of blocks
            //  to get number between [1.00000001, 1.99999999].
            // This will be the multiplier if 
            //  fewer blocks have passed than `BLOCKS_TO_REACH_MAX_MULTIPLIER`.
            // Otherwise the multiplier will be `MAX_MULTIPLIER`.
            MAX_MULTIPLIER.min(  
                diffBlocksSinceInvest_
                    .add(BLOCKS_TO_REACH_MAX_MULTIPLIER)
                    .mul(MULTIPLIER_DECIMALS)
                    .div(BLOCKS_TO_REACH_MAX_MULTIPLIER)
            );

        // reward = tier reward * number of blocks passed * multiplied / e8.
        reward_ = tierRewardValues()[uint256(userTier_)]
            .mul(diffBlocksSinceInvest_)
            .mul(multiplier_)
            .div(MULTIPLIER_DECIMALS);
    }

    /// Mint reward and upgrade the last claim register by the user.
    function claim() external override {
        uint256 reward_ = getReward(msg.sender);

        require(reward_ > 0, "Claimer: no reward to claim");

        _mint(msg.sender, reward_);

        // Update `lastClaim`, next claims will be calculated from this moment.
        lastClaim[msg.sender] = block.number;

        emit RedeemReward(msg.sender, reward_);
    }
}
