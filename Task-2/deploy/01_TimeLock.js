const { ethers ,upgrades } = require("hardhat");
let { MIN_DELAY } = require("../helper.config.js");
let {updateAddress} = require("../utils/address.js")
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments, getChainId, network }) => {
    const { log,deploy } = deployments;
    const { deployer } = await getNamedAccounts(); // it will tell who is going to deploy the contract
    const chainId = await getChainId();

    log("---------------- TimeLock Proxy ----------------");
    log("Deploying TimeLock and waiting for confirmations...")
    const timeLock = await deploy("TimeLock", {
      from: deployer,
      /**
       * Here we can set any address in admin role also zero address.
       * previously In tutorial deployer has given admin role then
       * renounced as well. in later section so we are doing the same by giving admin role to
       * deployer and then renounced to keep the tutorial same.
       */
      args: [MIN_DELAY, [], [], deployer],
      log: true,
      // we need to wait if on a live network so we can verify properly
      waitConfirmations: network.config.blockConfirmations || 1,
    })

    // If you need to interact with the contract or output its address, you can do so directly.
    log(`TimeLock proxy address: ${  timeLock.address}   :   chain id: ${chainId}`);
    await updateAddress("TimeLock",timeLock.address)
}



module.exports.tags = ["TimeLock", "all"];
