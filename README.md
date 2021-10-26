# ERC20 emissions

This is the draft, it is an initial phase of the contract that allows users to invest funds, to later obtain a reward exchangeable for NFTs.

The contract are deployed in Mumbai, see the demo [**here**](https://bsdmv-wyaaa-aaaad-qankq-cai.ic.fleek.co/)

[**Planing**](https://docs.google.com/document/d/1u8cs_PrxGBKHLk9jD1hM3G9rWKKh6PRRvu39L9QyFG8/edit?ts=60e5a921#heading=h.s2ybe8291aua)  

Prestige Tiers

 - BRONCE = 0.5 USDC
 - 	SILVER = 1 USDC
 - 	GOLD = 2.5 USDC
 - 	PLATINUM = 5 USDC

## TODO ✅ ❌
- ✅ put dummy erc20 in a subdir like test/DummyERC20 so it's clear that it is not for production.
- ✅ comments on dummy erc20.
- ✅ superfluous extra whitespace in dummy erc20.
- i'm not seeing hardhat or slither tests in CI.
- ✅ have client side code in a separate repo so it doesn't confuse/scope creep audits.
* * [**Client**](https://github.com/nazhG/prestige-point-client) 
- ✅ use solhint to check that line lengths are 80 chars.
- ✅ event Claim(address indexed account, bytes data); would match rain claim.
- ✅ not all @param are documented.
- ✅ inmutable -> immutable.
- ✅ user could achieves -> user could achieve.
- ✅ 155520000 magic number should be a constant with comments.
- ✅ 100000000 magic number should be a constant with comments.
- ✅ 46656000 magic number should be a constant with comments.
- ✅ lastClaim[account_] > userJoinBlockNumber ? lastClaim[account_] : userJoinBlockNumber can be lastClaim[account_].max(userJoinBlockNumber).
- ✅ if user does not have a tier then don't they have a future block number, which would cause the block.number.sub() to error?.
* * There is no problem because a report of a user without tier is the maximum int32, this number is used in the calculation of the multiplier but since the reward is 0 for an untier person, the multiplier does not matter.

- ✅ uint256[8] private tierValues is storage not immutable and so should not exist.
- ✅ calculating getReward twice in claim is gas intensive.
- ✅ emit the claim event after the state changes for consistency with rain.
- ✅ if (userTier_ > ITier.Tier.Zero) should be a check at the top of getReward to avoid paying gas for calculating a noop.
- ✅ why are the reward values each tier equal to the tier values on the transfer tier contract?.
* * The reward is 10% of the land value, it is earned after one year, for that, in the `tierRewardValues` the value divided by the number of blocks in a year and by 10,
that way, after a year, I reward her (without multiplier),
is 10% of the value of the tier.
[**Doc**](https://docs.google.com/presentation/d/1dCxF4ziYG33WjNReNuHzSwFO22F0JMB5YhA_plCDwLs/edit#slide=id.ge3a182e7e0_0_5) 

## Running tests ⚙️

_In order to test using a mainnet fork you must set:_

* [**ALCHEMY_MUMBAI_KEY**](https://dashboard.alchemyapi.io/apps)  
* [**COINMARKETCAP_API_KEY**](https://pro.coinmarketcap.com/account)
* **PRIVATE_KEY** is just used in deploy script

_in your .env file_

```
npm run test
```

## Frontend _/prestige-point-client_

```
npm run dev
```

## Built with 🛠️

- [Solidity](https://docs.soliditylang.org/en/v0.8.4/)
- [Hardhat](https://hardhat.org/) 👷
- [Svelte](https://svelte.dev/)

## License 📄

This project is under the MIT License - look up the file [LICENSE.md](LICENSE.md) for more details.