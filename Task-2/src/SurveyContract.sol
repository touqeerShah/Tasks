// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/governance/IGovernor.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
// it will provide all the help for upgradabel contract
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
// it ill help us to rectrict only owner will allow to upgrade the contract
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// we didn't initializ values in contractor other when we upgrade the contract we have to initilize values again
// because it global and static values are not become part of bytcode of proxy contract
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {IStakingContract} from "./interfaces/IStakingContract.sol";
import {ISurveyContract} from "./interfaces/ISurveyContract.sol";

// The SurveyContract allows creating, voting on, and managing surveys related to governance decisions.
// It integrates with a governance contract and a staking contract to ensure only stakeholders can vote.
contract SurveyContract is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ISurveyContract
{
    // Reference to the staking contract to check if a user has staked tokens.
    IStakingContract public stakingContract;

    // Admin role hash for managing surveys and other administrative functions.
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Reference to the governance contract for proposing, voting, queuing, and executing proposals.
    IGovernor public governor;

    // Struct to represent a survey, including its description, status, and related proposal ID.
    struct Survey {
        string description;
        bool status;
        uint256 proposalId;
    }

    // Mapping from token address to survey ID to Survey struct for storing surveys.
    mapping(address => mapping(uint256 => Survey)) public surveys;

    // Mapping to track the next survey ID for each token address.
    mapping(address => uint256) private nextSurveyId;
    // Mapping to track if there's an ongoing survey for each token
    mapping(address => bool) private ongoingSurvey;

    // Constructor sets the governor contract address and initializes the admin role.

    function initialize(address _governor) public initializer {
        __Ownable_init(msg.sender);
        governor = IGovernor(_governor);
        _grantRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
    }

    // Modifier to check if a user has staked tokens before allowing them to vote.

    modifier onlyStack(address _token, address user) {
        uint256 amount = stakingContract.getUserStackingAmount(_token, user);
        require(amount > 0, "Please stake tokens to be allowed to vote");
        _;
    }

    // Creates a new survey and proposes it to the governance contract.
    // Emits a CreateSurvey event upon successful creation.
    function createSurvey(address _token, string memory _description) external onlyStack(_token, msg.sender) {
        require(!ongoingSurvey[_token], "One survey is already ongoing");

        uint256 surveyId = nextSurveyId[_token]++;
        bytes4 selector = bytes4(keccak256("approvedSurvey(address,uint256)"));

        // Prepares the function call for the governance proposal.
        bytes memory encodedFunctionCall = abi.encodeWithSelector(selector, _token, surveyId);
        address[] memory targetContracts = new address[](1);
        targetContracts[0] = address(this);
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory functionCalls = new bytes[](1);
        functionCalls[0] = encodedFunctionCall;

        uint256 proposalId = governor.propose(targetContracts, values, functionCalls, _description);

        surveys[_token][surveyId] = Survey(_description, false, proposalId);
        ongoingSurvey[_token] = true;
        emit CreateSurvey(proposalId, surveyId, _description);
    }

    // Marks a survey as approved. Can only be called by the contract owner.
    // Emits a SurveyApproved event upon approval.
    function approvedSurvey(address _token, uint256 _surveyId) external onlyOwner {
        surveys[_token][_surveyId].status = true;
        ongoingSurvey[_token] = false;
        emit SurveyApproved(_surveyId);
    }

    // Function to set or update the stakingContract address
    function setStakingContract(address _stakingContract) external onlyRole(ADMIN_ROLE) {
        require(_stakingContract != address(0), "Invalid staking contract address");
        stakingContract = IStakingContract(_stakingContract);
        emit StakingContractUpdated(_stakingContract);
    }

    // Returns a hash of the proposal description, used for identifying proposals in the governance contract.
    function getDescriptionHash(string memory proposalDescription) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(proposalDescription));
    }

    // Retrieves survey information by token and ID.
    function getSurvey(address token, uint256 surveyId) external view returns (string memory, bool, uint256) {
        Survey memory survey = surveys[token][surveyId];
        return (survey.description, survey.status, survey.proposalId);
    }

    // Returns the next survey ID for a given token.
    function getLastSurveyId(address token) external view returns (uint256) {
        return nextSurveyId[token];
    }

    // Additional functionalities or modifications can be added as required for the contract's purpose.
    function _authorizeUpgrade(address newImplementation) internal virtual override onlyRole(ADMIN_ROLE) {}
}
