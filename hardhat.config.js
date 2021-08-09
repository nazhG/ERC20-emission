/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("dotenv").config();
require("@nomiclabs/hardhat-truffle5");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");

module.exports = {
  networks: {
    hardhat: {
      forking: {
        // url: "https://matic-mainnet.chainstacklabs.com",
        url: `https://polygon-mumbai.g.alchemy.com/v2/${ process.env.ALCHEMY_MUMBAI_KEY }`,
        accounts: [`0x${ process.env.PRIVATE_KEY }`],
        chainID: 80001,
        gasPrice: 20000000000,
      }
    },
    testnet: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ process.env.ALCHEMY_MUMBAI_KEY }`,
      accounts: [`0x${ process.env.PRIVATE_KEY }`],
      chainID: 80001,
      gasPrice: 20000000000,
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  mocha: {
    timeout: 240000,
  },
};
