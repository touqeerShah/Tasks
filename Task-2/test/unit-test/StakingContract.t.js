const { ethers, deployments } = require("hardhat");
const { parseEther } = require("ethers");
const { expect } = require("chai");
const {
    constants,
    expectRevert,
} = require('@openzeppelin/test-helpers');


let { getAddress } = require("../../utils/address.js")

describe("Unit Test GovernanceToken", function () {
    let deployer,
        redeemer,
        user,
        GovernanceToken,
        StakingContract,
        FakeGovernanceTokenProxyAddress,
        GovernanceTokenProxyAddress,
        StakingContractProxyAddress,
        ERC20Mock,
        ERC20MockAddress,
        SurveyContract,
        SurveyContractAddress;
    const minStakingAmount = parseEther("10");

    beforeEach(async function () {
        // Assuming deployer is the initial owner and will transfer ownership to StakingContract
        [deployer, redeemer, FakeGovernanceTokenProxyAddress, user] = await ethers.getSigners();

        // Deploy your contracts here or get already deployed contracts
        // This is a simplified example; you should replace it with your actual deployment logic
        await deployments.fixture(["all"]); // This will run all deployment scripts tagged with "all"

        GovernanceTokenProxyAddress = await getAddress("GovernanceToken")
        StakingContractProxyAddress = await getAddress("StakingContract")
        ERC20MockAddress = await getAddress("ERC20Mock")
        SurveyContractAddress = await getAddress("SurveyContract")
        GovernanceToken = await ethers.getContractAt("GovernanceToken", GovernanceTokenProxyAddress);
        StakingContract = await ethers.getContractAt("StakingContract", StakingContractProxyAddress);
        ERC20Mock = await ethers.getContractAt("ERC20Mock", ERC20MockAddress);
        SurveyContract = await ethers.getContractAt("SurveyContract", SurveyContractAddress);

        await StakingContract.whitelistToken(ERC20MockAddress);
        await ERC20Mock.connect(deployer).transfer(user, minStakingAmount);

        // Transfer ownership of GovernanceToken to StakingContract
        // Assume this is done in the deployment script or elsewhere before tests
    });

    it("Whitelists ERC20Mock Token", async function () {
        await expect(StakingContract.whitelistToken(ERC20MockAddress))
            .to.emit(StakingContract, "TokenWhitelisted")
            .withArgs(ERC20MockAddress);
    });
    it("DeWhitelistToken ERC20Mock Token", async function () {
        await expect(StakingContract.dewhitelistToken(ERC20MockAddress))
            .to.emit(StakingContract, "TokenDewhitelisted")
            .withArgs(ERC20MockAddress);
    });
    it("Should emit GovernorTokenSet event on setting governance token", async function () {
        await expect(StakingContract.setGovernanceToken(FakeGovernanceTokenProxyAddress.address))
            .to.emit(StakingContract, "GovernorTokenSet")
            .withArgs(FakeGovernanceTokenProxyAddress.address);
    });

    it("Should revert when trying to set governance token to the zero address", async function () {
        await expect(StakingContract.setGovernanceToken(constants.ZERO_ADDRESS))
            .to.be.revertedWith("GovernanceToken: not Address Zero");
    });

    it("Should emit SurveyContract event on setting governance token", async function () {
        await expect(StakingContract.setSurveyContract(FakeGovernanceTokenProxyAddress.address))
            .to.emit(StakingContract, "SurveyContractUpdated")
            .withArgs(FakeGovernanceTokenProxyAddress.address);
    });

    it("Should revert when trying to set survey contract  to the zero address", async function () {
        await expect(StakingContract.setSurveyContract(constants.ZERO_ADDRESS))
            .to.be.revertedWith("SurveyContract: not Address Zero");
    });

    it("Should revert when New Owner: not Address Zero", async function () {
        // Assuming `StakingContract` is already deployed and `redeemer` is another account
        // Make sure governanceToken is not set or is address(0)

        await expect(StakingContract.transferGovernanceTokenOwnership(constants.ZERO_ADDRESS))
            .to.be.revertedWith("New Owner: not Address Zero");
    });

    it("Should emit GovernanceOwnershipTransferred event on successful ownership transfer", async function () {
        // Setup your scenario where governanceToken is set and the caller is the owner
        // For example, set the governanceToken address if not already set
        // Use the owner account to call transferGovernanceTokenOwnership
        const newOwner = redeemer.address; // Assuming `redeemer` is to be the new owner

        await expect(StakingContract.transferGovernanceTokenOwnership(newOwner))
            .to.emit(StakingContract, "GovernanceOwnershipTransferred")
            .withArgs(GovernanceTokenProxyAddress, newOwner); // Adjust according to your contract's event parameters
    });


    it("should revert if the staked amount is less than minStakingAmount", async () => {
        const stakeAmount = parseEther("1"); // Less than minStakingAmount

        await ERC20Mock.connect(deployer).approve(StakingContractProxyAddress, stakeAmount);
        await expect(StakingContract.connect(deployer).stake(ERC20MockAddress, stakeAmount))
            .to.be.revertedWith("Amount must meet the minimum staking requirement");
    });


    it("Should revert when trying to stake more than once", async function () {
        const stakeAmount = minStakingAmount;
        await ERC20Mock.connect(deployer).approve(StakingContractProxyAddress, stakeAmount);
        await StakingContract.connect(deployer).stake(ERC20MockAddress, stakeAmount);
        // Attempt to stake again
        await expect(StakingContract.connect(deployer).stake(ERC20MockAddress, stakeAmount))
            .to.be.revertedWith("Already staked, can only stake once");
    });

    it("Should increase the contract's token balance on successful stake", async function () {
        const stakeAmount = minStakingAmount;
        const initialContractBalance = await ERC20Mock.balanceOf(StakingContractProxyAddress);
        await ERC20Mock.connect(deployer).approve(StakingContractProxyAddress, stakeAmount);
        await StakingContract.connect(deployer).stake(ERC20MockAddress, stakeAmount);
        const finalContractBalance = await ERC20Mock.balanceOf(StakingContractProxyAddress);
        expect(finalContractBalance).to.equal((initialContractBalance + stakeAmount));
    });

    it("Should mint governance tokens to the staker", async function () {
        // Assuming your governance token contract is already deployed and integrated
        const stakeAmount = minStakingAmount;
        await ERC20Mock.connect(deployer).transfer(redeemer, stakeAmount);
        await ERC20Mock.connect(redeemer).approve(StakingContractProxyAddress, stakeAmount);
        await StakingContract.connect(redeemer).stake(ERC20MockAddress, stakeAmount);
        // Replace `governanceToken` with your actual governance token contract instance
        const userGovernanceTokenBalance = await GovernanceToken.balanceOf(redeemer);
        expect(userGovernanceTokenBalance).to.equal(stakeAmount);
    });

    it("Should emit a Staked event on successful stake", async function () {
        const stakeAmount = minStakingAmount;
        await ERC20Mock.connect(deployer).approve(StakingContractProxyAddress, stakeAmount);
        await expect(StakingContract.connect(deployer).stake(ERC20MockAddress, stakeAmount))
            .to.emit(StakingContract, "Staked")
            .withArgs(deployer, stakeAmount);
    });

    it("Should increase totalStaked on successful stake", async function () {
        const stakeAmount = minStakingAmount;
        const initialTotalStaked = await StakingContract.totalStaked();
        await ERC20Mock.connect(deployer).approve(StakingContractProxyAddress, stakeAmount);
        await StakingContract.connect(deployer).stake(ERC20MockAddress, stakeAmount);
        const finalTotalStaked = await StakingContract.totalStaked();
        expect(finalTotalStaked).to.equal((initialTotalStaked + stakeAmount));
    });

    it("Allows staking of whitelisted ERC20Mock Tokens", async function () {
        const stakeAmount = parseEther("100");
        await StakingContract.whitelistToken(ERC20MockAddress);
        await ERC20Mock.approve(StakingContractProxyAddress, stakeAmount);
        await expect(StakingContract.connect(deployer).stake(ERC20MockAddress, stakeAmount))
            .to.emit(StakingContract, "Staked")
            .withArgs(deployer.address, stakeAmount);
    });

    it("Allows unstaking of ERC20Mock Tokens", async function () {
        const stakeAmount = parseEther("100");
        await StakingContract.whitelistToken(ERC20MockAddress);
        await ERC20Mock.approve(StakingContractProxyAddress, stakeAmount);
        await StakingContract.stake(ERC20MockAddress, stakeAmount);
        await expect(StakingContract.unstake(ERC20MockAddress))
            .to.emit(StakingContract, "Unstaked")
            .withArgs(deployer.address, stakeAmount);
    });
    it("Should revert when there's no amount staked", async function () {
        await expect(StakingContract.connect(user).unstake(ERC20MockAddress))
            .to.be.revertedWith("Nothing to unstake");
    });
    it("Should decrease totalStaked correctly after unstaking", async function () {
        // User stakes tokens first
        // Ensure user has approved the transfer
        await ERC20Mock.connect(user).approve(StakingContractProxyAddress, parseEther("10"));
        await StakingContract.connect(user).stake(ERC20MockAddress, parseEther("10"));

        const initialTotalStaked = await StakingContract.totalStaked();
        await StakingContract.connect(user).unstake(ERC20MockAddress);
        const finalTotalStaked = await StakingContract.totalStaked();

        expect(finalTotalStaked).to.equal((initialTotalStaked - (parseEther("10"))));
    });
    describe("Unit Test UnStacking", function () {
        beforeEach(async function () {
            console.log()
            const stakeAmount = parseEther("10");
            await ERC20Mock.connect(user).approve(StakingContractProxyAddress, stakeAmount);
            await StakingContract.connect(user).stake(ERC20MockAddress, stakeAmount);


        });
        it("Should reset user's staked balance to zero after unstaking", async function () {
            // Assume user has staked as in previous tests
            await StakingContract.connect(user).unstake(ERC20MockAddress);
            const userBalance = await StakingContract.stakes(ERC20MockAddress, user.address);
            expect(userBalance).to.equal(0);
        });
        it("Should return staked tokens to user after unstaking", async function () {
            const initialBalance = await ERC20Mock.balanceOf(user.address);
            // Assume user has staked as in previous tests
            await StakingContract.connect(user).unstake(ERC20MockAddress);
            const finalBalance = await ERC20Mock.balanceOf(user.address);

            expect(finalBalance).to.be.above(initialBalance);
        });

        it("Should reduce and burn the user's governance token balance upon unstaking", async function () {
            // This test depends on the implementation details of your governance token
            // Assuming the governance token is minted upon staking and burned upon unstaking
            // You'll need to adapt this test to fit your governance token logic
            const beforeUnstackTotalSupply = await GovernanceToken.totalSupply();
            // Assume user has staked as in previous tests
            const stakeAmount = parseEther("10");

            await StakingContract.connect(user).unstake(ERC20MockAddress);
            const afterUnstackTotalSupply = await GovernanceToken.totalSupply();
            expect(afterUnstackTotalSupply).to.equal((beforeUnstackTotalSupply - stakeAmount));

        });
    });

    describe("Getter Functions", function () {
        beforeEach(async function () {
            console.log()
            const stakeAmount = parseEther("10");
            await ERC20Mock.connect(user).approve(StakingContractProxyAddress, stakeAmount);
            await StakingContract.connect(user).stake(ERC20MockAddress, stakeAmount);


        });
        it("should correctly report the total staked amount", async function () {

            const totalStaked = await StakingContract.getTotalStaked();
            expect(totalStaked).to.equal(minStakingAmount);
        });

        it("should return the correct stake amount for a user", async function () {
           

            const userStakeAmount = await StakingContract.connect(user).myStakeAmount(ERC20MockAddress);
            expect(userStakeAmount).to.equal(minStakingAmount);
        });

        it("should return the correct stake amount for a user when queried specifically", async function () {
        
            const userStakeAmount = await StakingContract.getUserStackingAmount(ERC20MockAddress, user.address);
            expect(userStakeAmount).to.equal(minStakingAmount);
        });

        it("should allow the owner to update the minimum staking amount and emit an event", async function () {
            const newMinStakingAmount = parseEther("5");
            await expect(StakingContract.setMinStakingAmount(newMinStakingAmount))
                .to.emit(StakingContract, "MinStakingAmountUpdated")
                .withArgs(newMinStakingAmount);

            // Assuming there's a getter for the minStakingAmount (not shown in your contract code)
            const minStakingAmount = await StakingContract.minStakingAmount();
            expect(minStakingAmount).to.equal(newMinStakingAmount);
        });
    });

});

