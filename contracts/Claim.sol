//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { PrestigePoints } from "./PrestigePoints.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { TierUtil } from "./interfaces/tv-tier/libraries/TierUtil.sol";
import { ERC20TransferTier } from "./interfaces/tv-tier/tier/ERC20TransferTier.sol";

/// @title Terra Virtual Rewards Minter
/// @author nazhG
/// @notice This constract let user invest and claim the reward token
/// @dev this contract is a draft
contract Claim is Initializable {

    address tokenAddress;
    address tierAddress;

    // store the block number when user claim
    mapping(address => uint256) lastClaim;

	/// @param _tokenAddress reward token address
	/// @param _tierAddress tier contract address
    function initialize(address _tokenAddress,address _tierAddress) public initializer {
		tokenAddress = _tokenAddress;
		tierAddress = _tierAddress;
    }

    function getReward(address account_) external view returns(uint256) {
        uint256 report_ = ERC20TransferTier(tierAddress).report(account_);
        // block number that passed since the user joined the tier
        // using the block when de user join the tier or the last block number when teh user claim
        uint256 joinBlock = uint256(uint32(uint256(report_ >> ((getTier(account_)-1)*32))));
        return (block.number - (lastClaim[msg.sender] > joinBlock ? lastClaim[msg.sender]:joinBlock));
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