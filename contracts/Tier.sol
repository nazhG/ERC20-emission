//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import { ITier } from "./interfaces/tv-tier/tier/ITier.sol";
import { ValueTier } from "./interfaces/tv-tier/tier/ValueTier.sol";
import { ReadWriteTier } from "./interfaces/tv-tier/tier/ReadWriteTier.sol";

/// @title Terra Virtual Tiers
/// @author nazhG
contract Tier is ReadWriteTier, ValueTier {

    constructor(uint256[8] memory tierValues_)
        ValueTier(tierValues_) {}

    function maxTier(uint256 value_) external view returns(ITier.Tier) {
        return valueToTier(value_);
    }

}