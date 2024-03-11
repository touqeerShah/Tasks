// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ISurveyContract {
    // Events to be emitted
    event CreateSurvey(uint256 indexed proposalId, uint256 indexed surveyId, string indexed description);
    event SurveyApproved(uint256 indexed surveyId);
    event StakingContractUpdated(address indexed newStakingContract);

    // Function signatures
    function createSurvey(address _token, string memory _description) external;
    function approvedSurvey(address token, uint256 surveyId) external;
    function getSurvey(address token, uint256 surveyId) external view returns (string memory, bool, uint256);
    function getLastSurveyId(address token) external view returns (uint256);
}
