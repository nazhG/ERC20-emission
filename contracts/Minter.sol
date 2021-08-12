//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { PrestigePoints } from "./PrestigePoints.sol";
import { ValueTier } from "./interfaces/tv-tier/tier/ValueTier.sol";

/// @title Terra Virtual Rewards Minter
/// @author nazhG
/// @notice This constract let user invest and claim the reward token
/// @dev this contract is a draft
contract Minter is Ownable, ValueTier {

	/// @notice Address of reward token
    address public tokenAddress;

    /// store the funds and when was freezed
    struct Invest {
        uint256 timeStart;
        uint256 funds;
    }

    /// @notice There is stored the users balances
    /// user address => token used to invest => user balance of that token
    mapping(address => Invest) public investorFunds;

    /// @notice All ERC20 all tokens with what can be used to pay
    mapping(address => bool) public paymentAllowed;

    /// @notice user invest
    event Freeze(
        address indexed user,
        address token,
        uint256 amount
    );

    /// @notice User refund invested
    event Unfreeze(
        address indexed user,
        address token,
        uint256 amount
    );

    /// @notice For method that need that user (msg.sender) have funds
    modifier userWithFunds () {
        require(investorFunds[msg.sender].funds > 0,"Minter: User without funds");
        _;
    }

	/// @param _tokenAddress reward token address
    constructor(address _tokenAddress, uint256[4] memory tierValues_) ValueTier(tierValues_){
		tokenAddress = _tokenAddress;
    }

    /// @notice Allows to use or stop using a token to freeze
    /// @param _token address of a ERC20 to set allowance
    /// @param _status true = can be used to freeze, false = can not be used to freeze
    /// @dev this method should be called after deploy to have at least one payment method
    function setPaymentAllowed(address _token, bool _status) onlyOwner external {
        paymentAllowed[_token] = _status;
    }

    /// @notice let the user freeze a asset, approval is needed to transfer 
    /// @param _token address of a ERC20 used to invest
    /// @param _tier that user want to be
	function freeze(address _token, uint256 _tier) external {
		require(paymentAllowed[_token], "Minter: Token not allowed");
        ERC20(_token).transferFrom(msg.sender, address(this), ValueTier.tierValues[_tier]);
        emit Freeze(msg.sender, _token, ValueTier.tierValues[_tier]);
        investorFunds[msg.sender] = Invest(block.timestamp, ValueTier.tierValues[_tier]);
	}

    /// @notice  this method send all the reward tokens to the user
	function claimReward() external userWithFunds {
		PrestigePoints(tokenAddress).claimReward(
            this.getCurrentReward(msg.sender), 
            msg.sender
        );
	}

    /// @notice this method let the user withdraw their funds
    /// @param _token address of the token that will be refund
	function unfreeze(address _token) external userWithFunds {
        ERC20(_token).transfer( address(this), investorFunds[msg.sender].funds);
        emit Unfreeze(msg.sender, _token, investorFunds[msg.sender].funds);
        investorFunds[msg.sender].funds = 0;
	}

    /// @notice get the tier number through the user's adress
    /// @param _user user's adress
    /// @dev return -1 if is not tier
    function getUserTier(address _user) external view returns (int256) {
        return int(uint(valueToTier(investorFunds[_user].funds))) - 1;
    }

    /// @notice calculate reward
    /// @param _user user's adress
    function getCurrentReward(address _user) external view returns (uint256 reward) {
        // prestige logic
        reward = 0;

        // earn no bonus rate = 10%
        uint256 rewardPerDay = investorFunds[_user].funds / 10;
        console.log("\tDaily earn rate: ", rewardPerDay);

        // this calculates how many days have passed since the investment
        // 86400 seconds in a day
        uint256 daysInvested = ( block.timestamp - investorFunds[_user].timeStart ) / 86400;
        console.log("\tDays that have passed since the investment : ", daysInvested);

        reward = rewardPerDay * daysInvested;

        // have full multipier ?
        // 1095 days = tree years
        if (daysInvested >= 1095) {
            reward <<= 1; // mul by 2 (Bit Shifts)
            console.log("\tFull Multipier : ", 2);
        } else if (daysInvested >= 1) {
            // Daily the multiplier increases 0.0009 to a maximum of 1 after tree years
            reward += 9 * reward * daysInvested / 10000;
            console.log("\tMultipier : ", 9 * daysInvested, " / 10000");
        }
    }

}