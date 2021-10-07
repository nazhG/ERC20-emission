# ERC20 emissions

This is the draft, it is an initial phase of the contract that allows users to invest funds, to later obtain a reward exchangeable for NFTs.

The contract are deployed in Mumbai, see the demo [**here**](https://bsdmv-wyaaa-aaaad-qankq-cai.ic.fleek.co/)

[**Planing**](https://docs.google.com/document/d/1u8cs_PrxGBKHLk9jD1hM3G9rWKKh6PRRvu39L9QyFG8/edit?ts=60e5a921#heading=h.s2ybe8291aua)  

Prestige Tiers

 - BRONCE = 0.5 USDC
 - 	SILVER = 1 USDC
 - 	GOLD = 2.5 USDC
 - 	PLATINUM = 5 USDC

## TODO

✅ still have a hardhat console dep in the contract
✅ MIT or CAL license?
✅ if reward per block is the same per tier for every claim, it is wasteful on gas to be recalculating it every time, set the rewards for each tier in an immutable during contract construction
✅ comments need a lot more work
? i think we want an IClaim and a general duration claim
✅ why would a claim contract have a getTier public function? tierAddress should be explicitly declared as public, and should be the authority on reports
- run solhint over everything using the same settings as rain protocol
✅ Terra Virtua not Terra Virtual
✅ sentences start with capital and end with full stop
? other claim contracts allow delegated claims, it seems to me that with a linear emissions schedule this would be fine to add here
✅ if we only calculate a single emissions value from the join date for a particular tier then this effectively deletes someones claim when they _increase_ their tier
✅ you can use tierBlock to get the block for a given tier, rather than manually bit shifting
✅ can we adopt the pattern that variables outside storage have _ suffix? e.g. diffBlocksSinceInvest_
❌ can we run slither over the whole thing?
✅ can we have the reward calculation expressed as a pure function in terms of a tier report and a last claim block?
✅ can we use safe math?
✅ can we just calculate the multiplier as uint256 multiplier = (2 * 18).min(diffBlocks.mul(multiplierPerBlock)) without the if block?
✅ can we use the same version of solidity as rain protocol?
✅ should be emitting event when claiming, see TierByConstructionClaim for an example

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