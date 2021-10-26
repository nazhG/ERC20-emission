//SPDX-License-Identifier: CAL
pragma solidity 0.6.12;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @dev Claimer Interface.
interface IClaim is IERC20 {
    /// Emitted when the reward is transferred to the account.
    /// @param account Where the reward token was transfered.
    /// @param amount of reward token transfered.
    event RedeemReward(address indexed account, uint256 amount);

    /// @dev Calculate the accumulated reward.
    /// @return reward_ amount of reclaimable tokens.
    function getReward(address account_)
        external
        view
        returns (uint256 reward_);

    /// @dev Transfer all accrued reward from the `msg.sender`.
    /// Reward is calculated from the last claim made
    ///  or when the user joined to the tier.
    ///
    /// Emits a { Claims } event.
    function claim() external;
}
