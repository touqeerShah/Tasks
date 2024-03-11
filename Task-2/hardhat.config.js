/** @type import('hardhat/config').HardhatUserConfig */

require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")

require("dotenv").config()
var {
  PROVIDER_HARDHAT_URL
} = process.env


module.exports = {
  paths: {
    sources: "./src",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {},
    localhost: {
      url: PROVIDER_HARDHAT_URL,
      chainId: 31337,
      allowUnlimitedContractSize: true

      // accounts: [`${PRIVATE_KEY_HARDHAT}`], // it will import default by hardhat
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "london"

    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    redeemer: {
      default: 1,
      2: 1, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  }
};
