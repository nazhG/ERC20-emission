//SPDX-License-Identifier: CAL
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title DummyERC20
/// @notice This is the ERC20 token to minted and test this.
///
/// @dev `mint` gives balance to an account for testing.
contract DummyERC20 is ERC20 {

    constructor () ERC20("Spacelens", "SPCL") public {}

    /// @notice Does mint for the `msg.sender`.
    /// @param amount_ of the total to be generated.
    function mint(uint256 amount_) external {
        _mint(msg.sender, amount_);
    }

}