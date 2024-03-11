const { ethers, deployments } = require("hardhat");
const { parseEther, keccak256, toUtf8Bytes } = require("ethers");
const { expect } = require("chai");
const {
    constants,
    expectRevert,
} = require('@openzeppelin/test-helpers');
let {
    developmentChains,
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    MIN_DELAY,
    VOTING_DELAY } = require("../../helper.config.js");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { moveBlocks } = require("../../utils/move-blocks");
const { moveTime } = require("../../utils/move-time.js");


let { getAddress } = require("../../utils/address.js")

describe("SurveyContract", function () {
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
        SurveyContractAddress,
        GovernorContract,
        GovernorContractAddress;
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
        GovernorContractAddress = await getAddress("GovernorContract")


        GovernanceToken = await ethers.getContractAt("GovernanceToken", GovernanceTokenProxyAddress);
        StakingContract = await ethers.getContractAt("StakingContract", StakingContractProxyAddress);
        ERC20Mock = await ethers.getContractAt("ERC20Mock", ERC20MockAddress);
        SurveyContract = await ethers.getContractAt("SurveyContract", SurveyContractAddress);
        GovernorContract = await ethers.getContractAt("GovernorContract", GovernorContractAddress);

        await StakingContract.whitelistToken(ERC20MockAddress);
        await ERC20Mock.connect(deployer).transfer(user, minStakingAmount);
        const stakeAmount = parseEther("10");
        await ERC20Mock.connect(user).approve(StakingContractProxyAddress, stakeAmount);
        await StakingContract.connect(user).stake(ERC20MockAddress, stakeAmount);
        // const userGovernanceTokenBalance = await GovernanceToken.balanceOf(user);
        // // console.log("userGovernanceTokenBalance",userGovernanceTokenBalance)
        const transactionResponse = await GovernanceToken.delegate(user);
        await transactionResponse.wait(1);
        // console.log(`Checkpoints: ${await GovernanceToken.numCheckpoints(stakeAmount)}`);
        // Transfer ownership of GovernanceToken to StakingContract
        // Assume this is done in the deployment script or elsewhere before tests
    });
    describe("Unit Test Create Survey", function () {

        it("Should revert when trying to create a survey without staking tokens", async function () {
            await expect(SurveyContract.connect(deployer).createSurvey(ERC20MockAddress, "Test survey"))
                .to.be.revertedWith("Please stake tokens to be allowed to vote");
        });

        it("Should revert if there is already an ongoing survey", async function () {
            let amount = await StakingContract.connect(user).getUserStackingAmount(ERC20MockAddress, user)

            await SurveyContract.connect(user).createSurvey(ERC20MockAddress, "First survey");

            // Attempt to create another survey while the first is ongoing
            await expect(SurveyContract.connect(user).createSurvey(ERC20MockAddress, "Second survey"))
                .to.be.revertedWith("One survey is already ongoing");
        });
        it("Should correctly create a new survey entry", async function () {
            await SurveyContract.connect(user).createSurvey(ERC20MockAddress, "New survey");

            const surveyId = Number(await SurveyContract.getLastSurveyId(ERC20MockAddress)) - 1;
            const survey = await SurveyContract.surveys(ERC20MockAddress, surveyId);

            expect(survey.description).to.equal("New survey");
            // Validate other fields as necessary, e.g., `survey.ongoing` and `survey.proposalId`
        });
        it("Should emit CreateSurvey event upon survey creation", async function () {
            await expect(SurveyContract.connect(user).createSurvey(ERC20MockAddress, "Survey event test"))
                .to.emit(SurveyContract, "CreateSurvey")
                .withArgs(anyValue, anyValue, anyValue);
        });

        it("Allows Unstaking After Creating a Survey in Pending State and Emits Unstaked Event", async function () {
            await SurveyContract.connect(user).createSurvey(ERC20MockAddress, "New survey");
            await expect(StakingContract.connect(user).unstake(ERC20MockAddress))
                .to.emit(StakingContract, "Unstaked")
                .withArgs(user.address, minStakingAmount);
        });
        it("Allows Unstaking After Creating a Survey in Active State and Emits Unstaked Event", async function () {
            await SurveyContract.connect(user).createSurvey(ERC20MockAddress, "New survey");

            const surveyId = Number(await SurveyContract.getLastSurveyId(ERC20MockAddress)) - 1;
            const survey = await SurveyContract.surveys(ERC20MockAddress, surveyId);
            // console.log("survey", survey)
            // let state = await GovernorContract.state(survey[2]);
            // console.log("before state", state)
            if (developmentChains.includes(network.name)) {
                await moveBlocks(VOTING_DELAY + 1)
            }
            // state = await GovernorContract.state(survey[2]);
            // console.log("after state", state)
            await expect(StakingContract.connect(user).unstake(ERC20MockAddress))
                .to.emit(StakingContract, "Unstaked")
                .withArgs(user.address, minStakingAmount);

        });

        it("Should revert when unstack after vote and survey  is still active ", async function () {
            await SurveyContract.connect(user).createSurvey(ERC20MockAddress, "New survey");

            const surveyId = Number(await SurveyContract.getLastSurveyId(ERC20MockAddress)) - 1;
            const survey = await SurveyContract.surveys(ERC20MockAddress, surveyId);
            // console.log("survey", survey)
            // let state = await GovernorContract.state(survey[2]);
            // console.log("before state", state)
            if (developmentChains.includes(network.name)) {
                await moveBlocks(VOTING_DELAY + 1)
            }
            await GovernorContract.connect(user).castVoteWithReason(survey[2], 1, "because i like idea");
            let isVoted = await GovernorContract.hasVoted(survey[2], user);
            console.log("isVoted ", isVoted)

            await expect(StakingContract.connect(user).unstake(ERC20MockAddress))
                .to.be.revertedWith("Unstaking not allowed if you have voted in an active survey");
            if (developmentChains.includes(network.name)) {
                await moveBlocks(VOTING_PERIOD + 1)
            }

        });

        it("Allows Unstaking voting over and moved to Queue ", async function () {
            await SurveyContract.connect(user).createSurvey(ERC20MockAddress, "New survey");

            const surveyId = Number(await SurveyContract.getLastSurveyId(ERC20MockAddress)) - 1;
            const survey = await SurveyContract.surveys(ERC20MockAddress, surveyId);
            // console.log("survey", survey)
            // let state = await GovernorContract.state(survey[2]);
            // console.log("before state", state)
            if (developmentChains.includes(network.name)) {
                await moveBlocks(VOTING_DELAY + 1)
            }
            await GovernorContract.connect(user).castVoteWithReason(survey[2], 1, "because i like idea");
            let isVoted = await GovernorContract.hasVoted(survey[2], user);
            console.log("isVoted ", isVoted)
            if (developmentChains.includes(network.name)) {
                await moveBlocks(VOTING_PERIOD + 1)
            }
            await expect(StakingContract.connect(user).unstake(ERC20MockAddress))
                .to.emit(StakingContract, "Unstaked")
                .withArgs(user.address, minStakingAmount);
        });
    });
    describe("Unit Test Approved Survey", function () {
        it("should revert when 'approvedSurvey' is called by a non-owner account", async function () {
            // Assuming your contract setup involves an initial survey creation,
            // replace '0' with the appropriate _surveyId and _token with its address.
            const _surveyId = 0;
            // Attempt to approve the survey with a non-owner account
            await expect(SurveyContract.connect(user).approvedSurvey(ERC20MockAddress, _surveyId))
                .to.be.revertedWithCustomError(SurveyContract, "OwnableUnauthorizedAccount")
                .withArgs(user.address);

        });

    });
    describe("Unit Test Queue Survey", function () {
        let survey;
        beforeEach(async function () {
            survey =await createAndVoteOnSurvey();
        });
        describe("Unit Test Queue Survey", function () {
            it("successful move Queue -> execution event upon successful survey queueing", async function () {
                const queueTx = await GovernorContract.connect(deployer).queue([SurveyContractAddress], [0], [encodedFunctionCall], descriptionHash);
                await queueTx.wait(1);
    
                let state = await GovernorContract.state(survey[2]);
                expect(state).to.equal(5); // Assuming 5 is the state for a queued survey
    
                if (developmentChains.includes(network.name)) {
                    await moveTime(MIN_DELAY + 1);
                    await moveBlocks(1);
                }
            });
        });
    
    });
    describe("Unit Test Execute Survey", function () {
        let beforeSurvey;
        beforeEach(async function () {
            beforeSurvey=  await createAndVoteOnSurvey();
        });
        it("changes state upon successful survey execution run approvedSurvey", async function () {
            // Queue the survey first
            await GovernorContract.connect(deployer).queue([SurveyContractAddress], [0], [encodedFunctionCall], descriptionHash).then(tx => tx.wait(1));

            if (developmentChains.includes(network.name)) {
                await moveTime(MIN_DELAY + 1);
                await moveBlocks(1);
            }

            // Execute the survey
            await GovernorContract.execute([SurveyContractAddress], [0], [encodedFunctionCall], descriptionHash).then(tx => tx.wait(1));

            let state = await GovernorContract.state(beforeSurvey[2]);
            expect(state).to.equal(7); // Adjust according to the correct expected state post-execution
            const afterSurvey = await SurveyContract.surveys(ERC20MockAddress, surveyId);
            expect(afterSurvey[1]).to.equal(!beforeSurvey[1]); // Adjust according to the correct expected state post-execution

        });
    });
    describe("setStakingContract", function () {
        it("updates the staking contract address and emits an event", async function () {
            await expect(SurveyContract.connect(deployer).setStakingContract(StakingContractProxyAddress))
                .to.emit(SurveyContract, "StakingContractUpdated")
                .withArgs(StakingContractProxyAddress);
    
            expect(await SurveyContract.stakingContract()).to.equal(StakingContractProxyAddress);
        });
    
        it("reverts with an invalid address", async function () {
            await expect(SurveyContract.connect(deployer).setStakingContract(constants.ZERO_ADDRESS))
                .to.be.revertedWith("Invalid staking contract address");
        });
    });
    describe("getSurvey", function () {
        it("retrieves the correct survey details", async function () {
            // Assume `createSurvey` is a function to add a survey for testing purposes.
            await SurveyContract.connect(user).createSurvey(ERC20MockAddress, "Test Survey");
    
            const survey = await SurveyContract.getSurvey(ERC20MockAddress, 0); // Adjust based on how surveys are indexed
            expect(survey[0]).to.equal("Test Survey");
            expect(survey[1]).to.equal(false);
        });
    });
    
    describe("getLastSurveyId", function () {
        it("returns the next survey ID correctly", async function () {
            const initialSurveyId = await SurveyContract.getLastSurveyId(ERC20MockAddress);
            await SurveyContract.connect(user).createSurvey(ERC20MockAddress, "Test Survey");
    
            const newSurveyId = await SurveyContract.getLastSurveyId(ERC20MockAddress);
            expect(newSurveyId).to.be.above(initialSurveyId);
        });
    });
    describe("getDescriptionHash", function () {
        it("returns the correct hash of the proposal description", async function () {
            const description = "Test Proposal";
            const expectedHash = keccak256(toUtf8Bytes(description));
    
            expect(await SurveyContract.getDescriptionHash(description)).to.equal(expectedHash);
        });
    });
    
    
    async function createAndVoteOnSurvey() {
        await SurveyContract.connect(user).createSurvey(ERC20MockAddress, "New survey");
        surveyId = Number(await SurveyContract.getLastSurveyId(ERC20MockAddress)) - 1;
        const survey = await SurveyContract.surveys(ERC20MockAddress, surveyId);

        if (developmentChains.includes(network.name)) {
            await moveBlocks(VOTING_DELAY + 1);
        }

        await GovernorContract.connect(user).castVoteWithReason(survey[2], 1, "because i like idea");
        if (developmentChains.includes(network.name)) {
            await moveBlocks(VOTING_PERIOD + 1);
        }

        args = [ERC20MockAddress, surveyId];
        descriptionHash = keccak256(toUtf8Bytes(survey[0]));
        encodedFunctionCall = SurveyContract.interface.encodeFunctionData("approvedSurvey", args);
        return survey;
    }
});

