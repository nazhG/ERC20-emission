//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { PrestigePoints } from "./PrestigePoints.sol";
import { TierUtil } from "./interfaces/tv-tier/libraries/TierUtil.sol";
import { ITier } from "./interfaces/tv-tier/tier/ITier.sol";
import { Tier } from "./Tier.sol";
import { ReadWriteTier } from "./interfaces/tv-tier/tier/ReadWriteTier.sol";

/// @title Terra Virtual Rewards Minter
/// @author nazhG
/// @notice This constract let user invest and claim the reward token
/// @dev this contract is a draft
contract Minter is Ownable {

	/// @notice Address of reward token
    address public tokenAddress;

	/// @notice Address of the token used in payments
    address public paymentTokenAddress;

	/// @notice Address of the tier contracts
    address public tierAddress;

    /// store the funds and when was freezed
    struct Invest {
        uint256 timeStart;
        uint256 funds;
    }

    /// @notice There is stored the users balances
    /// user address => token used to invest => user balance of that token
    mapping(address => Invest) public investorFunds;

    /// @notice user invest
    event Freeze(
        address indexed user,
        uint256 amount
    );

    /// @notice User refund invested
    event Unfreeze(
        address indexed user,
        address token,
        uint256 amount
    );

	/// @param _tokenAddress reward token address
    constructor(address _tokenAddress, address _paymentTokenAddress, address _tierAddress) {
		tokenAddress = _tokenAddress;
		paymentTokenAddress = _paymentTokenAddress;
		tierAddress = _tierAddress;
    }

    function isTier(address account_, ITier.Tier minimumTier_) public view returns (bool) {
        return 0 != TierUtil.tierBlock( Tier(tierAddress).report(account_), minimumTier_) &&
            TierUtil.tierBlock( Tier(tierAddress).report(account_), minimumTier_) != uint256(0xFFFFFFFF);
    }

    /// @param account_ Account to enforce tier of.
    /// @param minimumTier_ Minimum tier for the account.
    modifier onlyTier(address account_, ITier.Tier minimumTier_) {
        _;
        require(
            isTier(account_, minimumTier_),
            "MINIMUM_TIER"
        );
    }

    /// @notice let the user freeze a asset, approval is needed to transfer 
    /// @param _funds is how much it will freezed
	function freeze(uint256 _funds) external {
        ERC20(paymentTokenAddress).transferFrom(msg.sender, address(this), _funds);
        emit Freeze(msg.sender, _funds);
        Tier(tierAddress).setTier(msg.sender, Tier(tierAddress).maxTier(_funds), "");
        investorFunds[msg.sender].funds = _funds;
        investorFunds[msg.sender].timeStart = block.timestamp;
	}

    /// @notice  this method send all the reward tokens to the user
	function claimReward() external onlyTier(msg.sender, ITier.Tier.ONE) {
		PrestigePoints(tokenAddress).claimReward(
            this.getCurrentReward(msg.sender), 
            msg.sender
        );
        investorFunds[msg.sender].timeStart = block.timestamp;
	}

    /// @notice this method let the user withdraw their funds
	function unfreeze() external onlyTier(msg.sender, ITier.Tier.ONE) {
        require(investorFunds[msg.sender].funds > 0, "Minter: no funds to unfreeze");
        if (this.getCurrentReward(msg.sender) > 0) {
            this.claimReward();
        }
        console.log("Balnace ", investorFunds[msg.sender].funds);
        ERC20(paymentTokenAddress).transfer( address(this), investorFunds[msg.sender].funds);
        investorFunds[msg.sender].funds = 0;
        emit Unfreeze(msg.sender, paymentTokenAddress, investorFunds[msg.sender].funds);
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
        /// TODO uncheck math
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

    /// @dev this function is just for test
    function setFunds(address _user, Invest memory _invest) public {
        investorFunds[_user] = _invest;
    }
}