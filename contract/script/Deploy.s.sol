// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import "../src/Stablecoin.sol";
import "../src/CollateralAdapter.sol";
import "../src/VaultManager.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy mock price feed (for testnet only)
        // In production, use actual Chainlink/Redstone price feed
        MockPriceFeed priceFeed = new MockPriceFeed(2000e8, 8); // $2000 with 8 decimals
        console.log("MockPriceFeed deployed at:", address(priceFeed));

        // Deploy mock tokens (for testnet only)
        // In production, use actual S and stS token addresses
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
        sToken.mint(msg.sender, 1000e18);
        stSToken.mint(msg.sender, 1000e18);
        console.log("Test tokens minted to deployer");

        vm.stopBroadcast();

        // Save deployment addresses to file
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network: Sonic Testnet");
        console.log("Deployer:", msg.sender);
        console.log("MockPriceFeed:", address(priceFeed));
        console.log("MockSToken:", address(sToken));
        console.log("MockStSToken:", address(stSToken));
        console.log("CollateralAdapter:", address(collateralAdapter));
        console.log("Stablecoin:", address(stablecoin));
        console.log("VaultManager:", address(vaultManager));
        console.log("=========================\n");
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
}