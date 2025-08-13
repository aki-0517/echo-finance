// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Stablecoin is ERC20, Ownable, ReentrancyGuard {
    address public vaultManager;
    
    event VaultManagerUpdated(address indexed newVaultManager);
    
    modifier onlyVaultManager() {
        require(msg.sender == vaultManager, "Only VaultManager can call");
        _;
    }
    
    constructor() ERC20("eSUSD", "eSUSD") Ownable(msg.sender) {}
    
    function setVaultManager(address _vaultManager) external onlyOwner {
        require(_vaultManager != address(0), "Invalid address");
        vaultManager = _vaultManager;
        emit VaultManagerUpdated(_vaultManager);
    }
    
    function mint(address to, uint256 amount) external onlyVaultManager nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyVaultManager nonReentrant {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance");
        _burn(from, amount);
    }
}