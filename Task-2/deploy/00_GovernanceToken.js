const { ethers ,upgrades } = require("hardhat");
const { parseEther} = require("ethers") ;
let {updateAddress} = require("../utils/address.js")


require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments, getChainId, network }) => {
    const { log } = deployments;
    const { deployProxy } = upgrades;
    const { deployer } = await getNamedAccounts(); // it will tell who is going to deploy the contract
    const chainId = await getChainId();

    const GovernanceToken = await ethers.getContractFactory("GovernanceToken"); // Returns a new connection to the GovernanceToken contract
    log("---------------- GovernanceToken Proxy ----------------");

    log("Network is detected to be mock");

    const Proxy = await deployProxy(GovernanceToken, ["GVToken", "GV", deployer], {
        from: deployer,
        log: true,
        initializer: "initialize",
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    // The Proxy is now an instance of the deployed contract.
    await Proxy.waitForDeployment();

    // If you need to interact with the contract or output its address, you can do so directly.
    log(`GovernanceToken proxy address: ${ await Proxy.getAddress()}   :   chain id: ${chainId}`);
    await updateAddress("GovernanceToken",await Proxy.getAddress())

    // Additional logic can be executed here as needed, for example, delegation.
    await delegate(await Proxy.getAddress(), deployer);
    log("Delegation complete!");
}

const delegate = async (governanceTokenAddress, delegatedAccount) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);
    const mintResponse = await governanceToken.mint(delegatedAccount, parseEther("10000"));
    await mintResponse.wait(1);
    
    const transactionResponse = await governanceToken.delegate(delegatedAccount);
    await transactionResponse.wait(1);
    console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`);
};

module.exports.tags = ["GovernanceToken", "all"];
