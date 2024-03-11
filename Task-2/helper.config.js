const networkConfig = {
    hardhat: {},
    3: {
        name: "ropsten",
    },
    11155111: {
        name: "sepolia",
    },
}

const developmentChains = ["hardhat", "localhost"]
const MIN_DELAY = 3600 // 1 hour - after a vote passes, you have 1 hour before you can enact
const QUORUM_PERCENTAGE = 4 // Need 4% of voters to pass
//  const VOTING_PERIOD = 45818 // 1 week - how long the vote lasts. This is pretty long even for local tests
const VOTING_PERIOD = 5 // blocks
const VOTING_DELAY = 1 // 1 Block - How many blocks till a proposal vote becomes active

// 0x812F89E73e6C4ce1c68337D9FEB482200D0fC268
// 0x717925D5c09D9f58768c997AB1a829891bBd5039
module.exports = { networkConfig, developmentChains, MIN_DELAY, QUORUM_PERCENTAGE, VOTING_PERIOD, VOTING_DELAY }
