//SPDX-License-Identifier: CAL
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyERC20 is ERC20 {

    constructor () ERC20("Spacelens", "SPCL") public {
    }

    function mint(uint256 amount_) external {
        _mint(msg.sender, amount_);
    }


}