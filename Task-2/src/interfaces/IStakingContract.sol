// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IStakingContract {

    
    // Events
    event Staked(address indexed user, uint256 indexed amount);
    event Unstaked(address indexed user, uint256 indexed amount);
    event TokenWhitelisted(address indexed token);
    event TokenDewhitelisted(address indexed token);
    event SetGovernorTokenToken(address indexed token);
    event GovernorTokenSet(address indexed token); // Include this event if not automatically added by interface
    event MinStakingAmountUpdated(uint256 indexed newAmount);
    event SurveyContractUpdated(address indexed newServeyContract);
    event GovernanceOwnershipTransferred(address indexed governanceToken, address indexed newOwner);

    // Function signatures

    function whitelistToken(address _token) external;
    function dewhitelistToken(address _token) external;
    function setGovernanceToken(address _token) external;
    function transferGovernanceTokenOwnership(address newOwner) external ;
    function stake(address _token, uint256 _amount) external;
    function unstake(address _token) external;
    function getTotalStaked() external view returns (uint256);
    function myStakeAmount(address _token) external view returns (uint256);
    function getUserStackingAmount(address _token, address _user) external view returns (uint256);
}
