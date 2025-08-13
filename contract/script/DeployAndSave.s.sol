// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import "../src/Stablecoin.sol";
import "../src/CollateralAdapter.sol";
import "../src/VaultManager.sol";

contract DeployAndSaveScript is Script {
    function setUp() public {}

    function run() public {
        // Load private key from .env file
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy mock price feed (for testnet only)
        MockPriceFeed priceFeed = new MockPriceFeed(2000e8, 8); // $2000 with 8 decimals
        console.log("MockPriceFeed deployed at:", address(priceFeed));

        // Deploy mock tokens (for testnet only)
        MockSToken sToken = new MockSToken("Sonic", "S", 18);
        MockStSToken stSToken = new MockStSToken("Staked Sonic", "stS", 18, 1.1e18);
        console.log("MockSToken deployed at:", address(sToken));
        console.log("MockStSToken deployed at:", address(stSToken));

        // Deploy main contracts
        CollateralAdapter collateralAdapter = new CollateralAdapter(
            address(priceFeed),
            address(sToken),
            address(stSToken)
        );
        console.log("CollateralAdapter deployed at:", address(collateralAdapter));

        Stablecoin stablecoin = new Stablecoin();
        console.log("Stablecoin deployed at:", address(stablecoin));

        VaultManager vaultManager = new VaultManager(
            address(sToken),
            address(stSToken),
            address(collateralAdapter),
            address(stablecoin)
        );
        console.log("VaultManager deployed at:", address(vaultManager));

        // Set vault manager in stablecoin
        stablecoin.setVaultManager(address(vaultManager));
        console.log("VaultManager set in Stablecoin");

        // Mint some test tokens for testing (testnet only)
        sToken.mint(deployer, 1000e18);
        stSToken.mint(deployer, 1000e18);
        console.log("Test tokens minted to deployer");

        vm.stopBroadcast();

        // Write deployment addresses to files
        _writeContractAddresses(
            address(priceFeed),
            address(sToken),
            address(stSToken),
            address(collateralAdapter),
            address(stablecoin),
            address(vaultManager)
        );

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network: Sonic Testnet");
        console.log("Deployer:", deployer);
        console.log("MockPriceFeed:", address(priceFeed));
        console.log("MockSToken:", address(sToken));
        console.log("MockStSToken:", address(stSToken));
        console.log("CollateralAdapter:", address(collateralAdapter));
        console.log("Stablecoin:", address(stablecoin));
        console.log("VaultManager:", address(vaultManager));
        console.log("\nContract addresses have been saved to .env files");
        console.log("=========================\n");
    }

    function _writeContractAddresses(
        address priceFeed,
        address sToken,
        address stSToken,
        address collateralAdapter,
        address stablecoin,
        address vaultManager
    ) internal {
        // Write to contract/.env
        string memory contractEnv = string.concat(
            "# Contract Deployment Results\n",
            "PRIVATE_KEY=", vm.envString("PRIVATE_KEY"), "\n",
            "RPC_URL=", vm.envOr("RPC_URL", string("https://rpc.sonic.test")), "\n\n",
            "# Deployed Contract Addresses\n",
            "VAULT_MANAGER_ADDRESS=", vm.toString(vaultManager), "\n",
            "STABLECOIN_ADDRESS=", vm.toString(stablecoin), "\n",
            "COLLATERAL_ADAPTER_ADDRESS=", vm.toString(collateralAdapter), "\n",
            "S_TOKEN_ADDRESS=", vm.toString(sToken), "\n",
            "STS_TOKEN_ADDRESS=", vm.toString(stSToken), "\n",
            "PRICE_FEED_ADDRESS=", vm.toString(priceFeed), "\n"
        );
        
        vm.writeFile("contract/.env", contractEnv);

        // Write to web/.env for frontend
        string memory webEnv = string.concat(
            "# Frontend Configuration\n",
            "VITE_WALLETCONNECT_PROJECT_ID=", vm.envOr("VITE_WALLETCONNECT_PROJECT_ID", string("YOUR_PROJECT_ID")), "\n\n",
            "# Contract Addresses\n",
            "VITE_VAULT_MANAGER_ADDRESS=", vm.toString(vaultManager), "\n",
            "VITE_STABLECOIN_ADDRESS=", vm.toString(stablecoin), "\n",
            "VITE_COLLATERAL_ADAPTER_ADDRESS=", vm.toString(collateralAdapter), "\n",
            "VITE_S_TOKEN_ADDRESS=", vm.toString(sToken), "\n",
            "VITE_STS_TOKEN_ADDRESS=", vm.toString(stSToken), "\n\n",
            "# Network Configuration\n",
            "VITE_SONIC_TESTNET_RPC=https://rpc.sonic.test\n",
            "VITE_SONIC_EXPLORER=https://explorer.sonic.test\n"
        );
        
        vm.writeFile("web/.env", webEnv);
    }
}

// Mock contracts for testnet deployment
contract MockPriceFeed {
    int256 public price;
    uint8 public decimals;
    uint256 public updatedAt;
    
    constructor(int256 _price, uint8 _decimals) {
        price = _price;
        decimals = _decimals;
        updatedAt = block.timestamp;
    }
    
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 _updatedAt,
            uint80 answeredInRound
        )
    {
        return (1, price, block.timestamp, updatedAt, 1);
    }
    
    function setPrice(int256 _price) external {
        price = _price;
        updatedAt = block.timestamp;
    }
}

contract MockSToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
}

contract MockStSToken is MockSToken {
    uint256 public exchangeRate;
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _exchangeRate) 
        MockSToken(_name, _symbol, _decimals) {
        exchangeRate = _exchangeRate;
    }
    
    function setExchangeRate(uint256 _exchangeRate) external {
        exchangeRate = _exchangeRate;
    }
}