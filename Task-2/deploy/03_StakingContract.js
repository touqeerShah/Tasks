const { ethers, upgrades } = require("hardhat");
const { parseEther} = require("ethers") ;

let { updateAddress, getAddress } = require("../utils/address.js")


require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments, getChainId, network }) => {
    const { log } = deployments;
    const { deployProxy } = upgrades;
    const { deployer } = await getNamedAccounts(); // it will tell who is going to deploy the contract
    const chainId = await getChainId();

    const StakingContract = await ethers.getContractFactory("StakingContract"); // Returns a new connection to the StakingContract contract
    log("---------------- StakingContract Proxy ----------------");

    log("Network is detected to be mock");

    const Proxy = await deployProxy(StakingContract, [await getAddress("GovernorContract")], {
        from: deployer,
        log: true,
        initializer: "initialize",
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    // The Proxy is now an instance of the deployed contract.
    await Proxy.waitForDeployment();

    // If you need to interact with the contract or output its address, you can do so directly.
    log(`StakingContract proxy address: ${await Proxy.getAddress()}   :   chain id: ${chainId}`);
    await updateAddress("StakingContract", await Proxy.getAddress())
    await setGovernanceToken(await Proxy.getAddress(), await getAddress("GovernanceToken"), log)
}


const setGovernanceToken = async (stakingContractAddress, governanceToken, log) => {
    const stakingContract = await ethers.getContractAt("StakingContract", stakingContractAddress);
    const setGovernanceTokenResponse = await stakingContract.setGovernanceToken(governanceToken);
    await setGovernanceTokenResponse.wait(1);
    const setMinStakingAmountResponse = await stakingContract.setMinStakingAmount(parseEther("10"));
    await setMinStakingAmountResponse.wait(1);

    const governanceContract = await ethers.getContractAt("GovernanceToken", governanceToken);
    const governanceTokenResponse = await governanceContract.transferOwnership(stakingContractAddress);
    await governanceTokenResponse.wait(1);


    log("successful set GovernanceToken and Transfer ownership to StakingContract")
};


module.exports.tags = ["StakingContract", "all"];
