//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "hardhat/console.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Reward } from "./Reward.sol";
import { ValueTier } from "./interfaces/tv-tier/tier/ValueTier.sol";

/// @title Terra Virtual Rewards Minter
/// @author nazhG
/// @notice This constract let user invest and claim the reward token
/// @dev this contract is a draft
contract Minter is Ownable, ValueTier {
	/// @notice Address of reward token
    address public tokenAddress;

    /// @notice There is stored the users balances
    /// user address => token used to invest => user balance of that token
    mapping(address => uint256) public investorFunds;

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
        require(investorFunds[msg.sender] > 0,"Minter: User without funds");
        _;
    }

	/// @param _tokenAddress reward token address
    constructor(address _tokenAddress, uint256[4] memory tierValues_) public ValueTier(tierValues_){
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
    /// @param _amount of tokens to tranfer
	function freeze(address _token, uint256 _amount) external {
		require(paymentAllowed[_token], "Minter: Token not allowed");
        ERC20(_token).transferFrom(msg.sender, address(this), _amount);
        emit Freeze(msg.sender, _token, _amount);
        investorFunds[msg.sender] += _amount;
	}

    /// @notice  this method send all the reward tokens to the user
	function claimReward() external userWithFunds {
		Reward(tokenAddress).claimReward(
            5, 
            msg.sender
        );
	}

    /// @notice this method let the user withdraw their funds
    /// @param _token address of the token that will be refund
	function unfreeze(address _token) external userWithFunds {
        ERC20(_token).transfer( address(this), investorFunds[msg.sender]);
        emit Unfreeze(msg.sender, _token, investorFunds[msg.sender]);
        investorFunds[msg.sender] = 0;
	}

    /// @notice get the tier number through the user's adress
    /// @param _user user's adress
    function getUserTier(address _user) external view returns (uint) {
        return uint(valueToTier(investorFunds[_user]));
    }

}