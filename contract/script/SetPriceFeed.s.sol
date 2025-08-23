// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CollateralAdapter.sol";

contract SetPriceFeedScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address collateralAdapterAddress = vm.envAddress("COLLATERAL_ADAPTER_ADDRESS");
        address priceFeedAddress = vm.envAddress("PRICE_FEED_ADDRESS");
        
        require(collateralAdapterAddress != address(0), "COLLATERAL_ADAPTER_ADDRESS not set");
        require(priceFeedAddress != address(0), "PRICE_FEED_ADDRESS not set");
        
        vm.startBroadcast(deployerPrivateKey);
        
        CollateralAdapter adapter = CollateralAdapter(collateralAdapterAddress);
        adapter.setPriceFeed(priceFeedAddress);
        
        vm.stopBroadcast();
        
        console.log("Price feed updated successfully");
        console.log("CollateralAdapter:", collateralAdapterAddress);
        console.log("New Price Feed:", priceFeedAddress);
    }
}