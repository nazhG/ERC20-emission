//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { PrestigePoints } from "./PrestigePoints.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { TierUtil } from "./interfaces/tv-tier/libraries/TierUtil.sol";
import { ERC20TransferTier } from "./interfaces/tv-tier/tier/ERC20TransferTier.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title Terra Virtual Rewards Minter
/// @author nazhG
/// @notice This constract let user invest and claim the reward token
/// @dev this contract is a draft
contract Claim is Initializable, OwnableUpgradeable {

    address tokenAddress;
    address tierAddress;
    uint256 difficulty; /// in seconds

    bool public showConsole;

    function setShowConsole(bool _showConsole) public {
        showConsole = _showConsole;
    }

    // store the block number when user claim
    mapping(address => uint256) lastClaim;

	/// @param _tokenAddress reward token address
	/// @param _tierAddress tier contract address
    function initialize(address _tokenAddress,address _tierAddress, uint256 _difficulty) public initializer {
		tokenAddress = _tokenAddress;
		tierAddress = _tierAddress;
		difficulty = _difficulty;
        
        showConsole = true;
    }

    function setDifficulty(uint256 _difficulty) external onlyOwner {
        difficulty = _difficulty;
    }

    function getReward(address account_) external view returns(uint256 reward) {
        uint256 report_ = ERC20TransferTier(tierAddress).report(account_);
        // block number that passed since the user joined the tier
        // using the block when de user join the tier or the last block number when teh user claim
        uint256 joinBlock = uint256(uint32(uint256(report_ >> ((getTier(account_)-1)*32))));

        // prestige logic
        reward = 0;

        // earn no bonus rate = 10%
        uint256 rewardPerDay =  (ERC20TransferTier(tierAddress).tierValues())[getTier(account_)] / 10;
        
        // this calculates how many days have passed since the investment
        // 86400 seconds in a day
        uint256 daysInvested = ((block.number - (lastClaim[msg.sender] > joinBlock ? lastClaim[msg.sender]:joinBlock)) * difficulty) / 86400;

        if (showConsole) {
            console.log("\tDaily earn rate: ", rewardPerDay);
            console.log("\tDays that have passed since the investment : ", daysInvested);
        }

        reward = rewardPerDay * daysInvested;

        // have full multipier ?
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

    function claim() external {
        require(this.getReward(msg.sender) > 0, "Claimer: no reward to claim");
        PrestigePoints(tokenAddress).claimReward(this.getReward(msg.sender), msg.sender);
        lastClaim[msg.sender] = block.number;
    }

    function getTier(address account_) public view returns(uint256) {
        uint256 report_ = ERC20TransferTier(tierAddress).report(account_);
        return uint256(TierUtil.tierAtBlockFromReport(report_, block.number));
    }

}