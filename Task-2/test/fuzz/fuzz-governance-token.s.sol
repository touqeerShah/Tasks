// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import {GovernorContract} from "../../src/governance_standard/GovernorContract.sol";
import {TimeLock} from "../../src/governance_standard/TimeLock.sol";
import {GovernanceToken} from "../../src/GovernanceToken.sol";

contract GovernanceTokenScript is Script {
    function setUp() public {
        // GovernanceToken tk= new GovernanceToken();
        // tk.initialize("A","B",address(this));
        // uint256 minDelay=1;
        // address[] memory proposers=new address[](1);
        // address[] memory executors=new address[](1);
        // TimeLock t = new TimeLock(minDelay,proposers,executors,address(this));
        // GovernorContract g = new GovernorContract(tk,t);
    }

    function run() public {
        vm.broadcast();
    }
}
