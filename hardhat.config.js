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
        url: "https://matic-mainnet.chainstacklabs.com",
      }
    },
    mainnet: {
      url: "https://rpc-mumbai.matic.network",
      chainId: 137,
      gasPrice: 20000000000,
    },
    testnet: {
      url: "https://rpc-mumbai.matic.today",
      chainId: 80001,
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
