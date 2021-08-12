# ERC20 emissions

This is the draft, it is an initial phase of the contract that allows users to invest funds, to later obtain a reward exchangeable for NFTs.

The contract are deployed in Mumbai, see the demo [**here**](https://bsdmv-wyaaa-aaaad-qankq-cai.ic.fleek.co/)

[**Planing**](https://docs.google.com/document/d/1u8cs_PrxGBKHLk9jD1hM3G9rWKKh6PRRvu39L9QyFG8/edit?ts=60e5a921#heading=h.s2ybe8291aua)  

Prestige Tiers

 - BRONCE = 0.5 USDC
 - 	SILVER = 1 USDC
 - 	GOLD = 2.5 USDC
 - 	PLATINUM = 5 USDC

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