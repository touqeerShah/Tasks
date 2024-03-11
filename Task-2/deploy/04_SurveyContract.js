const { ethers, upgrades } = require("hardhat");

let { updateAddress, getAddress } = require("../utils/address.js")


require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments, getChainId, network }) => {
    const { log } = deployments;
    const { deployProxy } = upgrades;
    const { deployer } = await getNamedAccounts(); // it will tell who is going to deploy the contract
    const chainId = await getChainId();

    const SurveyContract = await ethers.getContractFactory("SurveyContract"); // Returns a new connection to the SurveyContract contract
    log("---------------- SurveyContract Proxy ----------------");

    log("Network is detected to be mock");

    const Proxy = await deployProxy(SurveyContract, [await getAddress("GovernorContract")], {
        from: deployer,
        log: true,
        initializer: "initialize",
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    // The Proxy is now an instance of the deployed contract.
    await Proxy.waitForDeployment();

    // If you need to interact with the contract or output its address, you can do so directly.
    log(`SurveyContract proxy address: ${await Proxy.getAddress()}   :   chain id: ${chainId}`);
    await updateAddress("SurveyContract", await Proxy.getAddress())
    await setStakingContract(await Proxy.getAddress(), await getAddress("StakingContract"),await getAddress("TimeLock"), log)
}


const setStakingContract = async (surveyContractAddress, stakingContractAddress,timeLock, log) => {
    const surveyContract = await ethers.getContractAt("SurveyContract", surveyContractAddress);
    const setStakingContractResponse = await surveyContract.setStakingContract(stakingContractAddress);
    await setStakingContractResponse.wait(1);

    const transferOwnershipResponse = await surveyContract.transferOwnership(timeLock);
    await transferOwnershipResponse.wait(1);
    
    const stakingContract = await ethers.getContractAt("StakingContract", stakingContractAddress);
    const setSurveyContractResponse = await stakingContract.setSurveyContract(surveyContractAddress);
    await setSurveyContractResponse.wait(1);


    log("successful set GovernanceToken and Transfer ownership to TimeLock")
};


module.exports.tags = ["SurveyContract", "all"];
