//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "hardhat/console.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Terra Virtual Rewards Token
/// @author nazhG
/// @notice This token is used to redeem NFT in terra virtua
/// @dev this contract is a draft
contract PrestigePoints is ERC20, Ownable {
	/// @notice Address of the contract with the logic to gives the rewards to the user
    address public minter;
		
    constructor() ERC20("TVP", "Terra Virtual Prestige") public {}

	/// @notice set the contract address that will be authorized to generate rewards
	/// @param _minter address of minter contract
	function setMinter(address _minter) external onlyOwner {
		minter = _minter;
	}

	/// @notice this method let to the Minter contract to send reward tokens to users
	/// @dev this methos mints tokens
	function claimReward(uint256 _rewardAmount, address _usersAdress) external {
		require(minter == msg.sender, "Reward: only minter");
        _mint(_usersAdress, _rewardAmount); // emit Transfer
    	console.log("\tReward minted: ", _rewardAmount);
	}

}