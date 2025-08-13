// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {CollateralAdapter} from "../src/CollateralAdapter.sol";
import {IPriceFeed} from "../src/interfaces/IPriceFeed.sol";
import {MockPriceFeed} from "../test/mocks/MockPriceFeed.sol";

/// @notice Updates CollateralAdapter's price feed to a mock that supports setPrice/setUpdatedAt
/// @dev Reads COLLATERAL_ADAPTER_ADDRESS from environment (.env written by DeployAndSave)
contract UpdatePriceFeedScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address collateralAdapterAddress = vm.envAddress("COLLATERAL_ADAPTER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy a fresh mock price feed with initial price $2000 (8 decimals like Chainlink)
        MockPriceFeed newFeed = new MockPriceFeed(2000e8, 8);
        console.log("New MockPriceFeed deployed at:", address(newFeed));

        // Point adapter to the new feed
        CollateralAdapter adapter = CollateralAdapter(collateralAdapterAddress);
        adapter.setPriceFeed(address(newFeed));
        console.log("CollateralAdapter price feed updated to:", address(newFeed));

        vm.stopBroadcast();

        // Optional: suggest how to refresh price later
        console.log("You can refresh price freshness anytime by calling setPrice on the mock feed.");
        console.log("Example: cast send %s 'setPrice(int256)' 2100e8 --private-key $PRIVATE_KEY", address(newFeed));
    }
}


