//SPDX-License-Identifier: CAL
pragma solidity 0.6.12;

import { Math } from "@openzeppelin/contracts/math/Math.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { TierUtil } from "@beehiveinnovation/rain-protocol/contracts/libraries/TierUtil.sol";
import { ERC20TransferTier } from "@beehiveinnovation/rain-protocol/contracts/tier/ERC20TransferTier.sol";
import { ITier } from "@beehiveinnovation/rain-protocol/contracts/tier/ITier.sol";

/// @title Terra Virtua Rewards Minter
/// @author nazhG
/// @notice this contract allows minting a reward based on the time that the user has been in a tier
/// @dev #draft
contract Claim is ERC20 {
    using SafeMath for uint; 

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

    // store the block number when user claimed
    mapping(address => uint256) lastClaim;

    /// A claim has been successfully processed for an account.
    event _claim(address indexed account, uint256 data_);

    constructor (address _tierAddress)
        public
	    ERC20("TVP", "Terra Virtual Prestige") {
        tierAddress = _tierAddress;
        
        uint256[8] memory _tierValues = ERC20TransferTier(_tierAddress).tierValues();
        rewardTierOne = _tierValues[0].div(15552);
        rewardTierTwo = _tierValues[1].div(15552);
        rewardTierThree = _tierValues[2].div(15552);
        rewardTierFour = _tierValues[3].div(15552);
        rewardTierFive = _tierValues[4].div(15552);
        rewardTierSix = _tierValues[5].div(15552);
        rewardTierSeven = _tierValues[6].div(15552);
        rewardTierEight = _tierValues[7].div(15552);
    }

    function tierRewardValues() internal view returns(uint256[8] memory tierValues_)  {
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

    /// @notice get the block number in which the user join their current tier
    function getGetJoinBlock(address account_) public view returns(uint256) {
        if(getTier(account_) == ITier.Tier.ZERO) { return 0; }
        uint256 report_ = ERC20TransferTier(tierAddress).report(account_);

        return TierUtil.tierBlock(report_, getTier(account_));
    }

    /// @notice reward calculation
    function getReward(address account_) public view returns(uint256 reward) {
        if(getTier(account_) == ITier.Tier.ZERO) { return 0; }
        uint256 userJoinBlockNumber = getGetJoinBlock(account_);

        // 1800 block per hours
        uint256 diffBlocksSinceInvest_ = (block.number.sub(lastClaim[account_] > userJoinBlockNumber ?
            lastClaim[account_]:userJoinBlockNumber
        ));
        
        // 1,296,000 block month
        uint256 multiplier_ = Math.min(2000, (diffBlocksSinceInvest_).mul(5).div(51840000) );
        reward = tierRewardValues()[uint256(getTier(account_))].mul(diffBlocksSinceInvest_).add(reward.mul(multiplier_)).div(1000);
    }

    /// @notice mint reward
    function claim() external {
        require(getReward(msg.sender) > 0, "Claimer: no reward to claim");
        emit _claim(msg.sender, getReward(msg.sender));

        _mint(msg.sender, getReward(msg.sender));

        lastClaim[msg.sender] = block.number;
    }

    /// @notice get the current tier of an user
    function getTier(address account_) public view returns (ITier.Tier) {
        uint256 report_ = ERC20TransferTier(tierAddress).report(account_);
        return TierUtil.tierAtBlockFromReport(report_, block.number);
    }

}