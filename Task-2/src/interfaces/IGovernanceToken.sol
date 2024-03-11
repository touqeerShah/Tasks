// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IGovernanceToken {
    function mint(address to, uint256 amount) external;
    function burn(address account, uint256 amount) external;
    function transferOwnership(address newOwner) external;
}
