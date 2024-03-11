// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/governance/IGovernor.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// it will provide all the help for upgradabel contract
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
// it ill help us to rectrict only owner will allow to upgrade the contract
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// we didn't initializ values in contractor other when we upgrade the contract we have to initilize values again
// because it global and static values are not become part of bytcode of proxy contract
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {IStakingContract} from "./interfaces/IStakingContract.sol";
import {ISurveyContract} from "./interfaces/ISurveyContract.sol";
import {IGovernanceToken} from "./interfaces/IGovernanceToken.sol";
// A contract for staking tokens to participate in governance decisions.
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StakingContract is Initializable, UUPSUpgradeable, OwnableUpgradeable, IStakingContract {
    using SafeERC20 for IERC20; // This is how you correctly apply SafeERC20

    IGovernanceToken public governanceToken;
    IGovernor public governor; // The governance contract instance.
    ISurveyContract public surveyContract;
    mapping(address => mapping(address => uint256)) public stakes; // Tracks staked tokens by user.
    mapping(address => bool) public whitelist; // Tracks whitelisted tokens for staking.
    IERC20 governorToken; // The token used for governance.
    uint256 public totalStaked; // Total tokens staked in the contract.
    uint256 public minStakingAmount; // Minimum amount required to stake.
    // Ensures only whitelisted tokens can be used for staking.

    modifier onlyWhitelisted(address _token) {
        require(whitelist[_token], "Token is not whitelisted for staking");
        _;
    }

    function initialize(address _governor) public initializer {
        __Ownable_init(msg.sender);
        governor = IGovernor(_governor);
    }

    // Allows the contract owner to whitelist a token for staking.

    function whitelistToken(address _token) public onlyOwner {
        whitelist[_token] = true;
        emit TokenWhitelisted(_token);
    }
    // Allows the contract owner to remove a token from the whitelist.

    function dewhitelistToken(address _token) public onlyOwner {
        whitelist[_token] = false;
        emit TokenDewhitelisted(_token);
    }
    // Allows the contract owner to set the governance token.

    function setSurveyContract(address _surveyContract) public onlyOwner {
        require(_surveyContract != address(0), "SurveyContract: not Address Zero");
        surveyContract = ISurveyContract(_surveyContract);
        emit SurveyContractUpdated(_surveyContract);
    }

    function setGovernanceToken(address _governanceToken) public onlyOwner {
        require(_governanceToken != address(0), "GovernanceToken: not Address Zero");
        governanceToken = IGovernanceToken(_governanceToken);
        emit GovernorTokenSet(_governanceToken);
    }

    function transferGovernanceTokenOwnership(address newOwner) public onlyOwner {
        require(address(governanceToken) != address(0), "GovernanceToken: not set");
        require(newOwner != address(0), "New Owner: not Address Zero");
        governanceToken.transferOwnership(newOwner);
        emit GovernanceOwnershipTransferred(address(governanceToken), newOwner);
    }

    // Allows users to stake whitelisted tokens.
    function stake(address _token, uint256 _amount) public onlyWhitelisted(_token) {
        address userAddress = msg.sender;

        require(_amount >= minStakingAmount, "Amount must meet the minimum staking requirement");
        require(stakes[_token][userAddress] == 0, "Already staked, can only stake once");
        IERC20(_token).safeTransferFrom(userAddress, address(this), _amount);
        stakes[_token][userAddress] = _amount;
        governanceToken.mint(userAddress, _amount);
        totalStaked += _amount;
        emit Staked(userAddress, _amount);
    }

    function unstake(address _token) public {
        address userAddress = msg.sender;

        require(stakes[_token][userAddress] > 0, "Nothing to unstake");
        uint256 surveyIndex = surveyContract.getLastSurveyId(_token);
        if (surveyIndex != 0) {
            // Get the latest survey details
            (,, uint256 proposalId) = surveyContract.getSurvey(_token, surveyIndex - 1);

            // Check the proposal state associated with the survey
            IGovernor.ProposalState state = governor.state(proposalId);
            bool isVoted = governor.hasVoted(proposalId, userAddress);
            // Check survey status and proposal state conditions
            // check survey created  is Active and voted so it have to wait until
            // survey is not over otherwise he will used some amount and vote with his other account
            require(
                !(isVoted && state == IGovernor.ProposalState.Active),
                "Unstaking not allowed if you have voted in an active survey"
            );
        }
        uint256 amount = stakes[_token][userAddress];
        totalStaked -= amount;
        stakes[_token][userAddress] = 0;
        IERC20(_token).transfer(userAddress, amount);
        governanceToken.burn(userAddress, amount);
        emit Unstaked(userAddress, amount);

        // Transfer tokens back to user here
    }
    // Returns the total amount of tokens staked in the contract.

    function getTotalStaked() public view returns (uint256) {
        return totalStaked;
    }

    // Returns the amount of tokens staked by a specific user.
    function myStakeAmount(address _token) public view returns (uint256) {
        return stakes[_token][msg.sender];
    }

    // Returns the amount of tokens staked by a specific user in a specific token.
    function getUserStackingAmount(address _token, address _user) public view returns (uint256) {
        return stakes[_token][_user];
    }

    // This function allows the contract owner to update the minimum staking amount.
    function setMinStakingAmount(uint256 _amount) public onlyOwner {
        minStakingAmount = _amount;
        emit MinStakingAmountUpdated(_amount);
    }

    function _authorizeUpgrade(address newImplementation) internal virtual override onlyOwner {}
}
