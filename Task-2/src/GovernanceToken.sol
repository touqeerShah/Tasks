// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract GovernanceToken is
    Initializable,
    ERC20Upgradeable,
    ERC20PermitUpgradeable,
    ERC20VotesUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable // Inherit from Ownable
{
  
    // it owner will be stacking contract
    function initialize(string memory _name, string memory _symbol, address _initialOwner) public initializer {
        __ERC20_init(_name, _symbol);
        __ERC20Permit_init(_name);
        __ERC20Votes_init();
        __Ownable_init(_initialOwner);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        super._update(from, to, value);
    }

    function nonces(address owner) public view override(ERC20PermitUpgradeable, NoncesUpgradeable) returns (uint256) {
        return super.nonces(owner);
    }

    // The functions below are overrides required by Solidity.

    // Expose public minting and burning functionality to the owner
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address account, uint256 amount) external {
        _burn(account, amount);
    }
}
