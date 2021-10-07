//SPDX-License-Identifier: CAL
pragma solidity 0.6.12;

import {Math} from "@openzeppelin/contracts/math/Math.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {TierUtil} from "@beehiveinnovation/rain-protocol/contracts/libraries/TierUtil.sol";
import {ERC20TransferTier} from "@beehiveinnovation/rain-protocol/contracts/tier/ERC20TransferTier.sol";
import {ITier} from "@beehiveinnovation/rain-protocol/contracts/tier/ITier.sol";

/// @title Terra Virtua Rewards Minter
/// Allows minting a reward based on the time that the user has been in a tier.
///
/// The user could achieves a tier in an independent contract
/// based on the time the user has in that tier
/// a reward will be calculated based on 10% of the value of the tier over a year
/// also get the maximum bonus, a multiplier by 2 for 3 years of holding
/// for a maximum return of 20% per annum of the value of the tier
contract Claim is ERC20 {
    using SafeMath for uint256;

    address immutable tierAddress;
    uint256 private immutable rewardTierOne;
    uint256 private immutable rewardTierTwo;
    uint256 private immutable rewardTierThree;
    uint256 private immutable rewardTierFour;
    uint256 private immutable rewardTierFive;
    uint256 private immutable rewardTierSix;
    uint256 private immutable rewardTierSeven;
    uint256 private immutable rewardTierEight;
    uint256[8] private tierValues;

    /// @dev Store the block number when user claimed.
    mapping(address => uint256) lastClaim;

    /// Claims successfully processed for an account.
    /// @param account Where the reward token was transfered.
    event _claim(address indexed account, uint256 data_);

    /// Set the `tierRewardValues` as a reference of the inmutable value.
    /// The reward is 10% of teh tier value along one year.
    /// So, the reward = tier_value * 10% / 15552000 (blocks in one year)
    constructor(address tierAddress_)
        public
        ERC20("TVP", "Terra Virtual Prestige")
    {
        tierAddress = tierAddress_;

        uint256[8] memory tierValues_ = ERC20TransferTier(tierAddress_)
            .tierValues();
        rewardTierOne = tierValues_[0].div(155520000);
        rewardTierTwo = tierValues_[1].div(155520000);
        rewardTierThree = tierValues_[2].div(155520000);
        rewardTierFour = tierValues_[3].div(155520000);
        rewardTierFive = tierValues_[4].div(155520000);
        rewardTierSix = tierValues_[5].div(155520000);
        rewardTierSeven = tierValues_[6].div(155520000);
        rewardTierEight = tierValues_[7].div(155520000);
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
    function getReward(address account_) public view returns (uint256 reward_) {
        uint256 report_ = ERC20TransferTier(tierAddress).report(account_);
        ITier.Tier userTier_ = TierUtil.tierAtBlockFromReport(
            report_,
            block.number
        );

        uint256 userJoinBlockNumber = TierUtil.tierBlock(report_, userTier_);

        // For the calculation of the holding days,
        // We use the number of the block in which the tier was joined
        // Unless you have already made a claim in that same tier.

        uint256 diffBlocksSinceInvest_ = (
            block.number.sub(
                lastClaim[account_] > userJoinBlockNumber
                    ? lastClaim[account_]
                    : userJoinBlockNumber
            )
        );
        
        // The multiplier can be up to a maximum of 2X after 3 years of holding,
        // Otherwise you calculate a fraction of 2 
        // div by the number of blocks in 3 years (46656000)

        uint256 multiplier_ = Math.min(
            100000000,
            diffBlocksSinceInvest_.mul(100000000).div(46656000)
        );

        // Block reward multiplied by the number of blocks,
        // Added to the reward times the multiplier,
        // The multiplier will always be a number between [0, 1].

        reward_ = userTier_ == ITier.Tier.ZERO
            ? 0
            : tierRewardValues()[uint256(userTier_)]
                .mul(diffBlocksSinceInvest_)
                .add(reward_.mul(multiplier_).div(100000000));
    }

    /// Mint reward and upgrade the last claim register by the user.
    function claim() external {
        require(getReward(msg.sender) > 0, "Claimer: no reward to claim");
        emit _claim(msg.sender, getReward(msg.sender));

        _mint(msg.sender, getReward(msg.sender));

        lastClaim[msg.sender] = block.number;
    }

}
