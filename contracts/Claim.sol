//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { TierUtil } from "./interfaces/tv-tier/libraries/TierUtil.sol";
import { ERC20TransferTier } from "./interfaces/tv-tier/tier/ERC20TransferTier.sol";
import "hardhat/console.sol";

/// @title Terra Virtual Rewards Minter
/// @author nazhG
/// @notice this contract allows minting a reward based on the time that the user has been in a tier
/// @dev #draft
contract Claim is ERC20 {

    address immutable tierAddress;

    // store the block number when user claimed
    mapping(address => uint256) lastClaim;

    constructor (address _tierAddress)
	    ERC20("TVP", "Terra Virtual Prestige") {
        tierAddress = _tierAddress;
    }

    /// @notice reward calculation
    function getReward(address account_) public view returns(uint256 reward) {

        uint256 report_ = ERC20TransferTier(tierAddress).report(account_);

        uint256 userJoinBlockNumber = uint256(uint32(uint256(report_ >> ((getTier(account_)-1)*32))));

        // The objective of the following calculation is that a user after one year can have a 100% return on his investment
        // the polygon network takes 2s to mine a block so if you divide the number of seconds in a year we have
        // 60s * 60min * 24h * 30days * 12months / 2s (difuculty) = 15552000
        uint256 rewardPerBlocks =  ((ERC20TransferTier(tierAddress).tierValues())[getTier(account_)] / 15552);
        
        // Number of difference blocks since the investment or the last user claim
        uint256 diffBlocksSinceInvest = (block.number - (lastClaim[msg.sender] > userJoinBlockNumber ?
            lastClaim[msg.sender]:userJoinBlockNumber
        ));
        reward = rewardPerBlocks * diffBlocksSinceInvest / 1000;
        // Multipier
        // Users can have a multiplier on their reward up to a maximum of 100% with 3 years in a tier
        if (diffBlocksSinceInvest >= 46656000) {
            reward <<= 1; // mul by 2
        } else if (diffBlocksSinceInvest >= 1) {
            reward += (reward * diffBlocksSinceInvest / 46656) / 1000;
        }
    }

    /// @notice mint reward
    function claim() external {
        require(getReward(msg.sender) > 0, "Claimer: no reward to claim");
        _mint(msg.sender, getReward(msg.sender));
        
        lastClaim[msg.sender] = block.number;
    }

    /// @notice get the current tier of an user
    function getTier(address account_) public view returns(uint256) {
        uint256 report_ = ERC20TransferTier(tierAddress).report(account_);
        return uint256(TierUtil.tierAtBlockFromReport(report_, block.number));
    }

}