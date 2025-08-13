// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IERC20Extended.sol";
import "./CollateralAdapter.sol";
import "./Stablecoin.sol";

contract VaultManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20Extended;
    using SafeERC20 for IStakedToken;
    
    struct Vault {
        uint256 collateralS;
        uint256 collateralStS;
        uint256 debt;
    }
    
    mapping(address => Vault) public vaults;
    
    // Protocol statistics tracking
    uint256 public totalSCollateral;
    uint256 public totalStSCollateral;
    
    IERC20Extended public immutable sToken;
    IStakedToken public immutable stSToken;
    CollateralAdapter public immutable collateralAdapter;
    Stablecoin public immutable stablecoin;
    
    uint256 public constant MCR = 150; // 150% = 1.5x
    uint256 public constant LIQUIDATION_DISCOUNT = 5; // 5%
    uint256 public constant PRECISION = 100;
    
    event CollateralDeposited(address indexed user, uint256 amount, bool isStS);
    event CollateralWithdrawn(address indexed user, uint256 amount, bool isStS);
    event StableMinted(address indexed user, uint256 amount);
    event StableBurned(address indexed user, uint256 amount);
    event VaultLiquidated(address indexed user, address indexed liquidator, uint256 collateralSeized);
    
    modifier validVault(address user) {
        require(vaults[user].collateralS > 0 || vaults[user].collateralStS > 0, "No vault exists");
        _;
    }
    
    constructor(
        address _sToken,
        address _stSToken,
        address _collateralAdapter,
        address _stablecoin
    ) Ownable(msg.sender) {
        require(_sToken != address(0), "Invalid S token");
        require(_stSToken != address(0), "Invalid stS token");
        require(_collateralAdapter != address(0), "Invalid collateral adapter");
        require(_stablecoin != address(0), "Invalid stablecoin");
        
        sToken = IERC20Extended(_sToken);
        stSToken = IStakedToken(_stSToken);
        collateralAdapter = CollateralAdapter(_collateralAdapter);
        stablecoin = Stablecoin(_stablecoin);
    }
    
    function depositCollateral(uint256 amount, bool isStS) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        if (isStS) {
            stSToken.safeTransferFrom(msg.sender, address(this), amount);
            vaults[msg.sender].collateralStS += amount;
            totalStSCollateral += amount;
        } else {
            sToken.safeTransferFrom(msg.sender, address(this), amount);
            vaults[msg.sender].collateralS += amount;
            totalSCollateral += amount;
        }
        
        emit CollateralDeposited(msg.sender, amount, isStS);
    }
    
    function withdrawCollateral(uint256 amount, bool isStS) external nonReentrant validVault(msg.sender) {
        require(amount > 0, "Amount must be greater than 0");
        
        Vault storage vault = vaults[msg.sender];
        
        if (isStS) {
            require(vault.collateralStS >= amount, "Insufficient stS collateral");
            vault.collateralStS -= amount;
            totalStSCollateral -= amount;
        } else {
            require(vault.collateralS >= amount, "Insufficient S collateral");
            vault.collateralS -= amount;
            totalSCollateral -= amount;
        }
        
        // Check if vault remains healthy after withdrawal
        if (vault.debt > 0) {
            require(getLTV(msg.sender) <= PRECISION * PRECISION / MCR, "Withdrawal would make vault unhealthy");
        }
        
        if (isStS) {
            stSToken.safeTransfer(msg.sender, amount);
        } else {
            sToken.safeTransfer(msg.sender, amount);
        }
        
        emit CollateralWithdrawn(msg.sender, amount, isStS);
    }
    
    function mintStable(uint256 amount) external nonReentrant validVault(msg.sender) {
        require(amount > 0, "Amount must be greater than 0");
        
        Vault storage vault = vaults[msg.sender];
        vault.debt += amount;
        
        // Check that LTV doesn't exceed maximum allowed (MCR = 150%, max LTV = 66.67%)
        require(getLTV(msg.sender) <= PRECISION * PRECISION / MCR, "Mint would exceed maximum LTV");
        
        stablecoin.mint(msg.sender, amount);
        emit StableMinted(msg.sender, amount);
    }
    
    function burnStable(uint256 amount) external nonReentrant validVault(msg.sender) {
        require(amount > 0, "Amount must be greater than 0");
        
        Vault storage vault = vaults[msg.sender];
        require(vault.debt >= amount, "Cannot burn more than debt");
        
        stablecoin.burn(msg.sender, amount);
        vault.debt -= amount;
        
        emit StableBurned(msg.sender, amount);
    }
    
    function liquidate(address user) external nonReentrant validVault(user) {
        require(user != msg.sender, "Cannot liquidate own vault");
        require(isLiquidatable(user), "Vault is not liquidatable");
        
        Vault storage vault = vaults[user];
        uint256 debt = vault.debt;
        
        // Calculate collateral to seize (with discount)
        uint256 collateralValue = getCollateralValue(user);
        uint256 discountedValue = collateralValue * (PRECISION - LIQUIDATION_DISCOUNT) / PRECISION;
        
        // Liquidator pays the debt
        stablecoin.burn(msg.sender, debt);
        vault.debt = 0;
        
        // Transfer collateral to liquidator at discounted rate
        if (vault.collateralS > 0) {
            sToken.safeTransfer(msg.sender, vault.collateralS);
            totalSCollateral -= vault.collateralS;
            vault.collateralS = 0;
        }
        if (vault.collateralStS > 0) {
            stSToken.safeTransfer(msg.sender, vault.collateralStS);
            totalStSCollateral -= vault.collateralStS;
            vault.collateralStS = 0;
        }
        
        emit VaultLiquidated(user, msg.sender, discountedValue);
    }
    
    function getCollateralValue(address user) public view returns (uint256) {
        Vault memory vault = vaults[user];
        return collateralAdapter.getCollateralUSDValue(vault.collateralS, vault.collateralStS);
    }
    
    function getLTV(address user) public view returns (uint256) {
        Vault memory vault = vaults[user];
        if (vault.debt == 0) return 0;
        
        uint256 collateralValue = getCollateralValue(user);
        if (collateralValue == 0) return type(uint256).max;
        
        // Return LTV in percentage with PRECISION scaling (e.g., 66 for 66%)
        return (vault.debt * PRECISION) / collateralValue;
    }
    
    function getHealthFactor(address user) public view returns (uint256) {
        uint256 ltv = getLTV(user);
        if (ltv == 0) return type(uint256).max;
        
        return (MCR * PRECISION * PRECISION) / ltv;
    }
    
    function isLiquidatable(address user) public view returns (bool) {
        return getLTV(user) > PRECISION * PRECISION / MCR;
    }
    
    function getMaxMintable(address user) public view returns (uint256) {
        uint256 collateralValue = getCollateralValue(user);
        uint256 currentDebt = vaults[user].debt;
        // collateralValue is in USD with 18 decimals
        // MCR is 150, so max debt is collateralValue / 1.5 = collateralValue * 100 / 150
        uint256 maxDebt = (collateralValue * PRECISION) / MCR;
        
        if (maxDebt <= currentDebt) return 0;
        return maxDebt - currentDebt;
    }
    
    // Protocol statistics functions
    function getTotalCollateralValue() public view returns (uint256) {
        return collateralAdapter.getCollateralUSDValue(totalSCollateral, totalStSCollateral);
    }
    
    function getTotalDebt() public view returns (uint256) {
        return stablecoin.totalSupply();
    }
    
    function getAllLiquidatableVaults(address[] calldata users) external view returns (address[] memory) {
        address[] memory liquidatable = new address[](users.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < users.length; i++) {
            if (isLiquidatable(users[i])) {
                liquidatable[count] = users[i];
                count++;
            }
        }
        
        // Create a properly sized array
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = liquidatable[i];
        }
        
        return result;
    }
}