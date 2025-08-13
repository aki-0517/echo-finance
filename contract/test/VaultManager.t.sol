// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import "../src/VaultManager.sol";
import "../src/CollateralAdapter.sol";
import "../src/Stablecoin.sol";
import "./mocks/MockPriceFeed.sol";
import "./mocks/MockTokens.sol";

contract VaultManagerTest is Test {
    VaultManager public vaultManager;
    CollateralAdapter public collateralAdapter;
    Stablecoin public stablecoin;
    MockPriceFeed public priceFeed;
    MockSToken public sToken;
    MockStSToken public stSToken;
    
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public liquidator = address(4);
    
    uint256 public constant INITIAL_S_PRICE = 2000e8; // $2000 with 8 decimals
    uint256 public constant INITIAL_EXCHANGE_RATE = 1.1e18; // 1.1 with 18 decimals
    uint256 public constant PRECISION = 100;
    uint256 public constant MCR = 150;
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy mock tokens
        sToken = new MockSToken("Sonic", "S", 18);
        stSToken = new MockStSToken("Staked Sonic", "stS", 18, INITIAL_EXCHANGE_RATE);
        
        // Deploy price feed
        priceFeed = new MockPriceFeed(int256(INITIAL_S_PRICE), 8);
        
        // Deploy main contracts
        collateralAdapter = new CollateralAdapter(
            address(priceFeed),
            address(sToken),
            address(stSToken)
        );
        
        stablecoin = new Stablecoin();
        
        vaultManager = new VaultManager(
            address(sToken),
            address(stSToken),
            address(collateralAdapter),
            address(stablecoin)
        );
        
        // Set vault manager in stablecoin
        stablecoin.setVaultManager(address(vaultManager));
        
        vm.stopPrank();
        
        // Mint tokens to users
        sToken.mint(user1, 10e18);
        sToken.mint(user2, 10e18);
        stSToken.mint(user1, 10e18);
        stSToken.mint(user2, 10e18);
        
        // Give liquidator some tokens for liquidations
        sToken.mint(liquidator, 20e18);
    }
    
    function testDepositCollateral() public {
        vm.startPrank(user1);
        
        sToken.approve(address(vaultManager), 5e18);
        vaultManager.depositCollateral(5e18, false);
        
        (uint256 sCollateral, uint256 stSCollateral, uint256 debt) = vaultManager.vaults(user1);
        assertEq(sCollateral, 5e18);
        assertEq(stSCollateral, 0);
        assertEq(debt, 0);
        
        vm.stopPrank();
    }
    
    function testDepositStSCollateral() public {
        vm.startPrank(user1);
        
        stSToken.approve(address(vaultManager), 3e18);
        vaultManager.depositCollateral(3e18, true);
        
        (uint256 sCollateral, uint256 stSCollateral, uint256 debt) = vaultManager.vaults(user1);
        assertEq(sCollateral, 0);
        assertEq(stSCollateral, 3e18);
        assertEq(debt, 0);
        
        vm.stopPrank();
    }
    
    function testMintStable() public {
        vm.startPrank(user1);
        
        // Deposit 5 S tokens as collateral
        sToken.approve(address(vaultManager), 5e18);
        vaultManager.depositCollateral(5e18, false);
        
        // Mint 6000 eSUSD (should be within limits: 5 * $2000 / 1.5 = $6666 max)
        vaultManager.mintStable(6000e18);
        
        (,, uint256 debt) = vaultManager.vaults(user1);
        assertEq(debt, 6000e18);
        assertEq(stablecoin.balanceOf(user1), 6000e18);
        
        vm.stopPrank();
    }
    
    function testCannotMintExceedingLTV() public {
        vm.startPrank(user1);
        
        sToken.approve(address(vaultManager), 1e18);
        vaultManager.depositCollateral(1e18, false);
        
        // Try to mint more than allowed (1 * $2000 / 1.5 = $1333 max)
        vm.expectRevert("Mint would exceed maximum LTV");
        vaultManager.mintStable(1400e18);
        
        vm.stopPrank();
    }
    
    function testBurnStable() public {
        vm.startPrank(user1);
        
        // Setup: deposit and mint
        sToken.approve(address(vaultManager), 5e18);
        vaultManager.depositCollateral(5e18, false);
        vaultManager.mintStable(1000e18);
        
        // Burn 500 eSUSD
        stablecoin.approve(address(vaultManager), 500e18);
        vaultManager.burnStable(500e18);
        
        (,, uint256 debt) = vaultManager.vaults(user1);
        assertEq(debt, 500e18);
        assertEq(stablecoin.balanceOf(user1), 500e18);
        
        vm.stopPrank();
    }
    
    function testWithdrawCollateral() public {
        vm.startPrank(user1);
        
        // Setup: deposit collateral
        sToken.approve(address(vaultManager), 5e18);
        vaultManager.depositCollateral(5e18, false);
        
        // Withdraw 2 S tokens
        vaultManager.withdrawCollateral(2e18, false);
        
        (uint256 sCollateral,,) = vaultManager.vaults(user1);
        assertEq(sCollateral, 3e18);
        assertEq(sToken.balanceOf(user1), 7e18); // 10 - 5 + 2
        
        vm.stopPrank();
    }
    
    function testCannotWithdrawMakingVaultUnhealthy() public {
        vm.startPrank(user1);
        
        // Setup: deposit and mint at high LTV
        sToken.approve(address(vaultManager), 2e18);
        vaultManager.depositCollateral(2e18, false);
        vaultManager.mintStable(2600e18); // Close to max (2 * $2000 / 1.5 = $2666)
        
        // Try to withdraw collateral that would make vault unhealthy
        vm.expectRevert("Withdrawal would make vault unhealthy");
        vaultManager.withdrawCollateral(0.5e18, false);
        
        vm.stopPrank();
    }
    
    function testLiquidation() public {
        vm.startPrank(user1);
        
        // Setup: create a liquidatable position
        sToken.approve(address(vaultManager), 2e18);
        vaultManager.depositCollateral(2e18, false);
        vaultManager.mintStable(2600e18);
        
        vm.stopPrank();
        
        // Make vault liquidatable by dropping price
        priceFeed.setPrice(1500e8); // Drop from $2000 to $1500
        
        // Verify vault is liquidatable
        assertTrue(vaultManager.isLiquidatable(user1));
        
        // Setup liquidator with eSUSD  
        vm.startPrank(liquidator);
        sToken.approve(address(vaultManager), 5e18);
        vaultManager.depositCollateral(5e18, false);
        // Max mintable for 5 S: 5 * 2000 * 100 / 150 = 6666.67, but let's be safe
        vaultManager.mintStable(3000e18);
        
        // Liquidate
        stablecoin.approve(address(vaultManager), 2600e18);
        vaultManager.liquidate(user1);
        vm.stopPrank();
        
        // Check vault is cleared
        (uint256 sCollateral, uint256 stSCollateral, uint256 debt) = vaultManager.vaults(user1);
        assertEq(sCollateral, 0);
        assertEq(stSCollateral, 0);
        assertEq(debt, 0);
        
        // Check liquidator received collateral (started with 20, deposited 5, got 2 from liquidation = 17)
        assertEq(sToken.balanceOf(liquidator), 17e18);
    }
    
    function testGetHealthFactor() public {
        vm.startPrank(user1);
        
        sToken.approve(address(vaultManager), 3e18);
        vaultManager.depositCollateral(3e18, false);
        vaultManager.mintStable(3000e18);
        
        uint256 healthFactor = vaultManager.getHealthFactor(user1);
        // Health factor should be 150 * 100 * 100 / 50 = 30000 (since LTV = 50%)
        // 3000 eSUSD debt vs 6000 USD collateral = 50% LTV
        assertEq(healthFactor, 30000);
        
        vm.stopPrank();
    }
    
    function testGetMaxMintable() public {
        vm.startPrank(user1);
        
        sToken.approve(address(vaultManager), 5e18);
        vaultManager.depositCollateral(5e18, false);
        
        uint256 maxMintable = vaultManager.getMaxMintable(user1);
        // 5 S * $2000 / 1.5 = $6666.67 max mintable
        assertEq(maxMintable, 6666666666666666666666);
        
        vm.stopPrank();
    }
    
    function testStSCollateralPricing() public {
        vm.startPrank(user1);
        
        // Deposit 1 stS token (worth 1.1 S due to exchange rate)
        stSToken.approve(address(vaultManager), 1e18);
        vaultManager.depositCollateral(1e18, true);
        
        uint256 collateralValue = vaultManager.getCollateralValue(user1);
        // 1 stS * 1.1 exchange rate * $2000 = $2200
        assertEq(collateralValue, 2200e18);
        
        vm.stopPrank();
    }
    
    function testCannotLiquidateHealthyVault() public {
        vm.startPrank(user1);
        
        sToken.approve(address(vaultManager), 5e18);
        vaultManager.depositCollateral(5e18, false);
        vaultManager.mintStable(1000e18); // Low LTV
        
        vm.stopPrank();
        
        assertFalse(vaultManager.isLiquidatable(user1));
        
        vm.startPrank(liquidator);
        stablecoin.approve(address(vaultManager), 1000e18);
        vm.expectRevert("Vault is not liquidatable");
        vaultManager.liquidate(user1);
        vm.stopPrank();
    }
}