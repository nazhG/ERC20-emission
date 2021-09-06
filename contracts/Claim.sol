//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { TierUtil } from "./interfaces/tv-tier/libraries/TierUtil.sol";
import { ERC20TransferTier } from "./interfaces/tv-tier/tier/ERC20TransferTier.sol";

/// @title Terra Virtual Rewards Minter
/// @author nazhG
/// @notice this contract allows minting a reward based on the time that the user has been in a tier
/// @dev #draft
contract Claim is ERC20 {

    address tierAddress;
    uint256 difficulty; /// in seconds

    /// @dev Debug tool
    bool public showConsole;
    function setShowConsole(bool _showConsole) public {
        showConsole = _showConsole;
    }

    // store the block number when user claimed
    mapping(address => uint256) lastClaim;

	/// @param _tierAddress contract that stores the tier
	/// @param _difficulty block mining time in second
    constructor (address _tierAddress, uint256 _difficulty)
	    ERC20("TVP", "Terra Virtual Prestige") {
		tierAddress = _tierAddress;
		difficulty = _difficulty;
        
        showConsole = true;
    }

    /// @notice reward calculation
    /// @dev Debug tool
    function getReward(address account_) public view returns(uint256 reward) {
        // The reward is calculated based on how many days the user stayed in the tier
        // and has a multiplier that increases linearly up to a maximum of 2X for maintaining a tier 3 years

        uint256 report_ = ERC20TransferTier(tierAddress).report(account_);
        // block numbers that passed since the user joined the tier
        uint256 joinBlock = uint256(uint32(uint256(report_ >> ((getTier(account_)-1)*32))));

        reward = 0;

        // earn rate (without bonus) = 10% of the tier value
        uint256 rewardPerDay =  (ERC20TransferTier(tierAddress).tierValues())[getTier(account_)] / 10;
        
        // this calculates how many days have passed since the investment 
        // or the last claim made by the user
        // mul for the difficulty, to get the time
        // and div by 86400 (one day) to get the days that the user spent in the tier since the last claim
        uint256 daysInvested = ((block.number - (lastClaim[msg.sender] > joinBlock ? lastClaim[msg.sender]:joinBlock)) * difficulty) / 86400;

        if (showConsole) {
            console.log("\tDaily earn rate: ", rewardPerDay);
            console.log("\tDays that have passed since the investment : ", daysInvested);
        }

        reward = rewardPerDay * daysInvested;

        // multipier
        // 1095 days = tree years
        if (daysInvested >= 1095) {
            reward <<= 1; // mul by 2
            if (showConsole) {
                console.log("\tFull Multipier : ", 2);
            }
        } else if (daysInvested >= 1) {
            // Daily the multiplier increases 0.0009 to a maximum of 1095 after days (tree years)
            reward += 9 * reward * daysInvested / 10000;
            if (showConsole) {
                console.log("\tMultipier : ", 9 * daysInvested, " / 10000");
            }
        }
    }

    /// @notice mint reward
    function claim() external {
        require(getReward(msg.sender) > 0, "Claimer: no reward to claim");
        _mint(msg.sender, getReward(msg.sender));
    	console.log("\tReward minted: ", getReward(msg.sender));
        lastClaim[msg.sender] = block.number;
    }

    /// @notice get the current tier of an user
    function getTier(address account_) public view returns(uint256) {
        uint256 report_ = ERC20TransferTier(tierAddress).report(account_);
        return uint256(TierUtil.tierAtBlockFromReport(report_, block.number));
    }

}