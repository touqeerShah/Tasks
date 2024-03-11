# Aderyn Analysis Report

This report was generated by [Aderyn](https://github.com/Cyfrin/aderyn), a static analysis tool built by [Cyfrin](https://cyfrin.io), a blockchain security company. This report is not a substitute for manual audit or security review. It should not be relied upon for any purpose other than to assist in the identification of potential security vulnerabilities.
# Table of Contents

- [Summary](#summary)
  - [Files Summary](#files-summary)
  - [Files Details](#files-details)
  - [Issue Summary](#issue-summary)
- [High Issues](#high-issues)
  - [H-1: Arbitrary `from` passed to `transferFrom` (or `safeTransferFrom`)](#h-1-arbitrary-from-passed-to-transferfrom-or-safetransferfrom)
- [Medium Issues](#medium-issues)
  - [M-1: Centralization Risk for trusted owners](#m-1-centralization-risk-for-trusted-owners)
  - [M-2: Using `ERC721::_mint()` can be dangerous](#m-2-using-erc721mint-can-be-dangerous)
- [Low Issues](#low-issues)
  - [L-1: Unsafe ERC20 Operations should not be used](#l-1-unsafe-erc20-operations-should-not-be-used)
  - [L-2: PUSH0 is not supported by all chains](#l-2-push0-is-not-supported-by-all-chains)
- [NC Issues](#nc-issues)
  - [NC-1: Functions not used internally could be marked external](#nc-1-functions-not-used-internally-could-be-marked-external)
  - [NC-2: Constants should be defined and used instead of literals](#nc-2-constants-should-be-defined-and-used-instead-of-literals)


# Summary

## Files Summary

| Key | Value |
| --- | --- |
| .sol Files | 9 |
| Total nSLOC | 376 |


## Files Details

| Filepath | nSLOC |
| --- | --- |
| src/GovernanceToken.sol | 41 |
| src/StakingContract.sol | 98 |
| src/SurveyContract.sol | 75 |
| src/governance_standard/GovernorContract.sol | 102 |
| src/governance_standard/TimeLock.sol | 10 |
| src/interfaces/IGovernanceToken.sol | 6 |
| src/interfaces/IStakingContract.sol | 21 |
| src/interfaces/ISurveyContract.sol | 10 |
| src/mock/ERC20Mock.sol | 13 |
| **Total** | **376** |


## Issue Summary

| Category | No. of Issues |
| --- | --- |
| Critical | 0 |
| High | 1 |
| Medium | 2 |
| Low | 2 |
| NC | 2 |


# High Issues

## H-1: Arbitrary `from` passed to `transferFrom` (or `safeTransferFrom`)

Passing an arbitrary `from` address to `transferFrom` (or `safeTransferFrom`) can lead to loss of funds, because anyone can transfer tokens from the `from` address if an approval is made.  

- Found in src/StakingContract.sol [Line: 83](src/StakingContract.sol#L83)

	```solidity
	        IERC20(_token).safeTransferFrom(userAddress, address(this), _amount);
	```



# Medium Issues

## M-1: Centralization Risk for trusted owners

Contracts have owners with privileged rights to perform admin tasks and need to be trusted to not perform malicious updates or drain funds.

- Found in src/GovernanceToken.sol [Line: 26](src/GovernanceToken.sol#L26)

	```solidity
	        onlyOwner
	```

- Found in src/GovernanceToken.sol [Line: 54](src/GovernanceToken.sol#L54)

	```solidity
	  function mint(address to, uint256 amount) external onlyOwner {
	```

- Found in src/StakingContract.sol [Line: 46](src/StakingContract.sol#L46)

	```solidity
	    function whitelistToken(address _token) public onlyOwner {
	```

- Found in src/StakingContract.sol [Line: 52](src/StakingContract.sol#L52)

	```solidity
	    function dewhitelistToken(address _token) public onlyOwner {
	```

- Found in src/StakingContract.sol [Line: 58](src/StakingContract.sol#L58)

	```solidity
	    function setSurveyContract(address _surveyContract) public onlyOwner {
	```

- Found in src/StakingContract.sol [Line: 64](src/StakingContract.sol#L64)

	```solidity
	    function setGovernanceToken(address _governanceToken) public onlyOwner {
	```

- Found in src/StakingContract.sol [Line: 70](src/StakingContract.sol#L70)

	```solidity
	    function transferGovernanceTokenOwnership(address newOwner) public onlyOwner {
	```

- Found in src/StakingContract.sol [Line: 137](src/StakingContract.sol#L137)

	```solidity
	    function setMinStakingAmount(uint256 _amount) public onlyOwner {
	```

- Found in src/SurveyContract.sol [Line: 93](src/SurveyContract.sol#L93)

	```solidity
	    function approvedSurvey(address _token, uint256 _surveyId) external onlyOwner {
	```

- Found in src/SurveyContract.sol [Line: 101](src/SurveyContract.sol#L101)

	```solidity
	    function setStakingContract(address _stakingContract) external onlyRole(ADMIN_ROLE) {
	```

- Found in src/SurveyContract.sol [Line: 124](src/SurveyContract.sol#L124)

	```solidity
	    function _authorizeUpgrade(address newImplementation) internal virtual override onlyRole(ADMIN_ROLE) {}
	```



## M-2: Using `ERC721::_mint()` can be dangerous

Using `ERC721::_mint()` can mint ERC721 tokens to addresses which don't support ERC721 tokens. Use `_safeMint()` instead of `_mint()` for ERC721.

- Found in src/GovernanceToken.sol [Line: 55](src/GovernanceToken.sol#L55)

	```solidity
	    _mint(to, amount);
	```

- Found in src/mock/ERC20Mock.sol [Line: 32](src/mock/ERC20Mock.sol#L32)

	```solidity
	        _mint(owner, amount);
	```

- Found in src/mock/ERC20Mock.sol [Line: 36](src/mock/ERC20Mock.sol#L36)

	```solidity
	        _mint(account, amount);
	```



# Low Issues

## L-1: Unsafe ERC20 Operations should not be used

ERC20 functions may not behave as expected. For example: return values are not always meaningful. It is recommended to use OpenZeppelin's SafeERC20 library.

- Found in src/StakingContract.sol [Line: 114](src/StakingContract.sol#L114)

	```solidity
	        IERC20(_token).transfer(userAddress, amount);
	```



## L-2: PUSH0 is not supported by all chains

Solc compiler version 0.8.20 switches the default target EVM version to Shanghai, which means that the generated bytecode will include PUSH0 opcodes. Be sure to select the appropriate EVM version in case you intend to deploy on a chain other than mainnet like L2 chains that may not support PUSH0, otherwise deployment of your contracts will fail.

- Found in src/GovernanceToken.sol [Line: 2](src/GovernanceToken.sol#L2)

	```solidity
	pragma solidity 0.8.20;
	```

- Found in src/StakingContract.sol [Line: 2](src/StakingContract.sol#L2)

	```solidity
	pragma solidity 0.8.20;
	```

- Found in src/SurveyContract.sol [Line: 2](src/SurveyContract.sol#L2)

	```solidity
	pragma solidity 0.8.20;
	```

- Found in src/governance_standard/GovernorContract.sol [Line: 3](src/governance_standard/GovernorContract.sol#L3)

	```solidity
	pragma solidity 0.8.20;
	```

- Found in src/governance_standard/TimeLock.sol [Line: 2](src/governance_standard/TimeLock.sol#L2)

	```solidity
	pragma solidity 0.8.20;
	```

- Found in src/interfaces/IGovernanceToken.sol [Line: 2](src/interfaces/IGovernanceToken.sol#L2)

	```solidity
	pragma solidity 0.8.20;
	```

- Found in src/interfaces/IStakingContract.sol [Line: 2](src/interfaces/IStakingContract.sol#L2)

	```solidity
	pragma solidity 0.8.20;
	```

- Found in src/interfaces/ISurveyContract.sol [Line: 2](src/interfaces/ISurveyContract.sol#L2)

	```solidity
	pragma solidity 0.8.20;
	```

- Found in src/mock/ERC20Mock.sol [Line: 26](src/mock/ERC20Mock.sol#L26)

	```solidity
	pragma solidity 0.8.20;
	```



# NC Issues

## NC-1: Functions not used internally could be marked external



- Found in src/GovernanceToken.sol [Line: 18](src/GovernanceToken.sol#L18)

	```solidity
	     function initialize(string memory _name, string memory _symbol, address _initialOwner) public initializer {
	```

- Found in src/GovernanceToken.sol [Line: 37](src/GovernanceToken.sol#L37)

	```solidity
	    function nonces(address owner)
	```

- Found in src/StakingContract.sol [Line: 39](src/StakingContract.sol#L39)

	```solidity
	    function initialize(address _governor) public initializer {
	```

- Found in src/StakingContract.sol [Line: 46](src/StakingContract.sol#L46)

	```solidity
	    function whitelistToken(address _token) public onlyOwner {
	```

- Found in src/StakingContract.sol [Line: 52](src/StakingContract.sol#L52)

	```solidity
	    function dewhitelistToken(address _token) public onlyOwner {
	```

- Found in src/StakingContract.sol [Line: 58](src/StakingContract.sol#L58)

	```solidity
	    function setSurveyContract(address _surveyContract) public onlyOwner {
	```

- Found in src/StakingContract.sol [Line: 64](src/StakingContract.sol#L64)

	```solidity
	    function setGovernanceToken(address _governanceToken) public onlyOwner {
	```

- Found in src/StakingContract.sol [Line: 70](src/StakingContract.sol#L70)

	```solidity
	    function transferGovernanceTokenOwnership(address newOwner) public onlyOwner {
	```

- Found in src/StakingContract.sol [Line: 78](src/StakingContract.sol#L78)

	```solidity
	    function stake(address _token, uint256 _amount) public onlyWhitelisted(_token) {
	```

- Found in src/StakingContract.sol [Line: 91](src/StakingContract.sol#L91)

	```solidity
	    function unstake(address _token) public {
	```

- Found in src/StakingContract.sol [Line: 122](src/StakingContract.sol#L122)

	```solidity
	    function getTotalStaked() public view returns (uint256) {
	```

- Found in src/StakingContract.sol [Line: 127](src/StakingContract.sol#L127)

	```solidity
	    function myStakeAmount(address _token) public view returns (uint256) {
	```

- Found in src/StakingContract.sol [Line: 132](src/StakingContract.sol#L132)

	```solidity
	    function getUserStackingAmount(address _token, address _user) public view returns (uint256) {
	```

- Found in src/StakingContract.sol [Line: 137](src/StakingContract.sol#L137)

	```solidity
	    function setMinStakingAmount(uint256 _amount) public onlyOwner {
	```

- Found in src/SurveyContract.sol [Line: 52](src/SurveyContract.sol#L52)

	```solidity
	    function initialize(address _governor) public initializer {
	```

- Found in src/SurveyContract.sol [Line: 108](src/SurveyContract.sol#L108)

	```solidity
	    function getDescriptionHash(string memory proposalDescription) public pure returns (bytes32) {
	```

- Found in src/governance_standard/GovernorContract.sol [Line: 33](src/governance_standard/GovernorContract.sol#L33)

	```solidity
	    function votingDelay()
	```

- Found in src/governance_standard/GovernorContract.sol [Line: 42](src/governance_standard/GovernorContract.sol#L42)

	```solidity
	    function votingPeriod()
	```

- Found in src/governance_standard/GovernorContract.sol [Line: 51](src/governance_standard/GovernorContract.sol#L51)

	```solidity
	    function quorum(uint256 blockNumber)
	```

- Found in src/governance_standard/GovernorContract.sol [Line: 60](src/governance_standard/GovernorContract.sol#L60)

	```solidity
	    function state(uint256 proposalId)
	```

- Found in src/governance_standard/GovernorContract.sol [Line: 69](src/governance_standard/GovernorContract.sol#L69)

	```solidity
	    function proposalNeedsQueuing(uint256 proposalId)
	```

- Found in src/governance_standard/GovernorContract.sol [Line: 78](src/governance_standard/GovernorContract.sol#L78)

	```solidity
	    function proposalThreshold()
	```



## NC-2: Constants should be defined and used instead of literals



- Found in src/StakingContract.sol [Line: 98](src/StakingContract.sol#L98)

	```solidity
	            (, , uint256 proposalId) = surveyContract.getSurvey(_token, surveyIndex - 1);
	```

- Found in src/SurveyContract.sol [Line: 77](src/SurveyContract.sol#L77)

	```solidity
	        address[] memory targetContracts = new address[](1);
	```

- Found in src/SurveyContract.sol [Line: 79](src/SurveyContract.sol#L79)

	```solidity
	        uint256[] memory values = new uint256[](1);
	```

- Found in src/SurveyContract.sol [Line: 81](src/SurveyContract.sol#L81)

	```solidity
	        bytes[] memory functionCalls = new bytes[](1);
	```


