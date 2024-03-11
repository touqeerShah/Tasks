// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "ds-test/test.sol";

import {CommonBase} from "forge-std/Base.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdUtils} from "forge-std/StdUtils.sol";
import "forge-std/console.sol";
import {GovernorContract} from "../../src/governance_standard/GovernorContract.sol";
import {TimeLock} from "../../src/governance_standard/TimeLock.sol";
import {GovernanceToken} from "../../src/GovernanceToken.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";
import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";

contract GovernanceTokenScript is DSTest, CommonBase, StdCheats, StdUtils {
    GovernanceToken gk;
    address[] accounts;
    ERC1967Proxy proxy;

    // address implementation;
    address owner;
    address newOwner;

    error OwnableUnauthorizedAccount(address account);

    bytes4 private constant OWNABLE_UNAUTHORIZED_ACCOUNT_SELECTOR =
        bytes4(keccak256("OwnableUnauthorizedAccount(address)"));

    function setUp() public {
        // Omitted other parts for brevity

        GovernanceToken implementation = new GovernanceToken();
        owner = vm.addr(1); // Setting the owner

        // Deploy the proxy and initialize the contract through the proxy
        bytes memory initData = abi.encodeCall(GovernanceToken.initialize, ("GK", "GK", owner));
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        console.log("Proxy deployed at:", address(proxy));

        gk = GovernanceToken(address(proxy));

        // Other setup code...
        // Define a new owner address for upgrade tests
        newOwner = address(1);
        // Emit the owner address for debugging purposes
        emit log_address(owner);
    }
    // Test the basic ERC20 functionality of the MyToken contract

    function testERC20Functionality() public {
        // Impersonate the owner to call mint function
        vm.prank(owner);
        // Mint tokens to address(2) and assert the balance
        gk.mint(address(2), 1000);
        assertEq(gk.balanceOf(address(2)), 1000);
    }

    function testNonOwnerCannotPerformMint(address nonOwner) public {
        // Skip this test case if the random address happens to be the contract owner
        // Expect the custom error when a non-owner tries the sensitive action
        if (nonOwner == owner) return;

        bytes memory encodedError = abi.encodeWithSelector(OwnableUnauthorizedAccount.selector, nonOwner);

        // Expect the encoded error
        vm.expectRevert(encodedError);

        vm.prank(nonOwner); // Impersonate the non-owner address
        gk.mint(address(2), 1000);
    }

    function testFuzzTransfer(uint256 rawAmount) public {
            uint256 amount = rawAmount % 1e24; // Example limit

        // Prepare: Set up a recipient address different from the deployer
        vm.startPrank(owner);
        // Mint tokens to address(2) and assert the balance
        gk.mint(owner, amount);
        assertEq(gk.balanceOf(owner), amount);

        vm.stopPrank();

        address recipient = address(0x1);

        // Fuzz: Attempt to transfer a random amount of tokens to the recipient
        uint256 deployerBalance = gk.balanceOf(owner);
        uint256 recipientBalance = gk.balanceOf(recipient);

        // Skip tests where amount exceeds the deployer's balance to prevent reverts
        if (amount+100 > deployerBalance) return;

        bool success = gk.transfer(recipient, amount);

        // Verify: Check if gks were transferred successfully
        assertTrue(success);
        assertEq(gk.balanceOf(owner), deployerBalance - amount);
        assertEq(gk.balanceOf(recipient), recipientBalance + amount);
    }
 
}
