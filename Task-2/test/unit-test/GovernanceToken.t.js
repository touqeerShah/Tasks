const { expect } = require("chai");
const { ethers, deployments } = require("hardhat");
const { parseEther} = require("ethers") ;
let { getAddress } = require("../../utils/address.js")

describe("Unit Test GovernanceToken", function () {
  let deployer, redeemer, GovernanceToken, StakingContract, GovernanceTokenProxyAddress, StakingContractProxyAddress;

  beforeEach(async function () {
    // Assuming deployer is the initial owner and will transfer ownership to StakingContract
    [deployer, redeemer] = await ethers.getSigners();

    // Deploy your contracts here or get already deployed contracts
    // This is a simplified example; you should replace it with your actual deployment logic
    await deployments.fixture(["all"]); // This will run all deployment scripts tagged with "all"
 
              GovernanceTokenProxyAddress=await getAddress("GovernanceToken")
              StakingContractProxyAddress=await getAddress("StakingContract")

    GovernanceToken = await ethers.getContractAt("GovernanceToken", GovernanceTokenProxyAddress);
    StakingContract = await ethers.getContractAt("StakingContract", StakingContractProxyAddress);

    // Transfer ownership of GovernanceToken to StakingContract
    // Assume this is done in the deployment script or elsewhere before tests
  });

  describe("Ownership", function () {
    it("should have StakingContract as the owner of GovernanceToken", async function () {
      const owner = await GovernanceToken.owner();
      expect(owner).to.equal(StakingContractProxyAddress);
    });
  });
});
