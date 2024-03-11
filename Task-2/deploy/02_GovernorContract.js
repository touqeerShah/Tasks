const { ethers } = require("hardhat");
let { QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY } = require("../helper.config.js");
let { getAddress,updateAddress } = require("../utils/address.js")
const {
    constants,
    expectRevert,
} = require('@openzeppelin/test-helpers');
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments, getChainId, network }) => {
    const { log,deploy } = deployments;
    const { deployer } = await getNamedAccounts(); // it will tell who is going to deploy the contract
    const chainId = await getChainId();

    log("---------------- GovernorContract Proxy ----------------");

    log("Network is detected to be mock", deployer);
    let governanceTokenAddress = await getAddress("GovernanceToken");
    let timeLockAddress = await getAddress("TimeLock");
    const args = [
        governanceTokenAddress,
        timeLockAddress,
        QUORUM_PERCENTAGE,
        VOTING_PERIOD,
        VOTING_DELAY,
    ]
    
    log("----------------------------------------------------")
    log("Deploying GovernorContract and waiting for confirmations...")
    const governorContract = await deploy("GovernorContract", {
      from: deployer,
      args, 
      log: true,
      // we need to wait if on a live network so we can verify properly
      waitConfirmations: network.config.blockConfirmations || 1,
    })

    // If you need to interact with the contract or output its address, you can do so directly.
    log(`GovernorContract proxy address: ${governorContract.address}   :   chain id: ${chainId}`);
    await updateAddress("GovernorContract",governorContract.address)

    setupContracts(timeLockAddress,governorContract.address,deployer,log)
    // Additional logic can be executed here as needed, for example, delegation.

}



const setupContracts = async function (timeLockAddress,GovernorContractAddress,deployer,log) {
   
    const timeLock = await ethers.getContractAt("TimeLock", timeLockAddress)
  
    log("----------------------------------------------------")
    log("Setting up contracts for roles...")
    // would be great to use multicall here...
    const proposerRole = await timeLock.PROPOSER_ROLE()
    const executorRole = await timeLock.EXECUTOR_ROLE()
    const adminRole = await timeLock.DEFAULT_ADMIN_ROLE()
  
    const proposerTx = await timeLock.grantRole(proposerRole, GovernorContractAddress)
    await proposerTx.wait(1)
    const executorTx = await timeLock.grantRole(executorRole, constants.ZERO_ADDRESS)
    await executorTx.wait(1)
    const revokeTx = await timeLock.revokeRole(adminRole, deployer)
    await revokeTx.wait(1)
    // Guess what? Now, anything the timelock wants to do has to go through the governance process!
  }
  

module.exports.tags = ["GovernorContract", "all"];
