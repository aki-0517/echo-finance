# Verify Contracts

Verifying your smart contract makes its source code publicly visible and auditable on the block explorer, creating transparency and trust. Here are the recommended methods to verify contracts on the [Sonic mainnet explorer](https://sonicscan.org/) and the [Sonic testnet explorer](https://testnet.sonicscan.org/).

— [Method 1: Hardhat Verification](#method-1.-hardhat-verification-recommended)\
— [Method 2: Programmatic Verification\
](#method-2-programmatic-verification)— [Method 3: Manual Verification](#method-3-manual-verification)\
— [Method 4: Flattened Source](#method-4-flattened-source)\
— [Method 5: Foundry Verify (Etherscan-compatible)](#method-5-foundry-verify-etherscan-compatible)\
— [Troubleshooting](#troubleshooting)

## Method 1. Hardhat Verification (_Recommended_)

The most streamlined way to verify contracts is using Hardhat with hardhat-toolbox:

1. Install Hardhat toolbox:

```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

2. Configure `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.26",
  networks: {
    sonic: {
      url: "https://rpc.soniclabs.com",
      chainId: 146,
      accounts: [SONIC_PRIVATE_KEY]
    },
    sonicTestnet: {
      url: "https://rpc.testnet.soniclabs.com",
      chainId: 57054,
      accounts: [SONIC_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      sonic: "YOUR_SONICSCAN_API_KEY",
      sonicTestnet: "YOUR_SONICSCAN_TESTNET_API_KEY" 
    },
    customChains: [
      {
        network: "sonic",
        chainId: 146,
        urls: {
          apiURL: "https://api.sonicscan.org/api",
          browserURL: "https://sonicscan.org"
        }
      },
      {
        network: "sonicTestnet",
        chainId: 57054,
        urls: {
          apiURL: "https://api-testnet.sonicscan.org/api",
          browserURL: "https://testnet.sonicscan.org"
        }
      }
    ]
  }
};
```

3. Store your SonicScan API key in a `.env` file:

```
API_KEY=your_sonicscan_api_key
```

4. Verify your contract:

```bash
# For mainnet
npx hardhat verify --network sonic DEPLOYED_CONTRACT_ADDRESS [CONSTRUCTOR_ARGUMENTS]

# For testnet
npx hardhat verify --network sonicTestnet DEPLOYED_CONTRACT_ADDRESS [CONSTRUCTOR_ARGUMENTS]
```

## Method 2: Programmatic Verification

For automated deployments, you can verify contracts programmatically in your deployment scripts:

```javascript
async function main() {
  // Deploy contract
  const Contract = await ethers.getContractFactory("YourContract");
  const contract = await Contract.deploy(constructorArg1, constructorArg2);
  await contract.waitForDeployment();
  
  console.log("Contract deployed to:", await contract.getAddress());
  
  // Wait for some block confirmations
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Verify the contract
  await hre.run("verify:verify", {
    address: await contract.getAddress(),
    constructorArguments: [constructorArg1, constructorArg2]
  });
}
```

## Method 3: Manual Verification

If automated methods fail, you can verify manually through the explorer interface:

1. Go to the [Sonic explorer](https://sonicscan.org/) (or the [testnet explorer](https://testnet.sonicscan.org/))
2. Navigate to your contract address
3. Click the _Contract_ tab and _Verify & Publish_
4. Fill in the verification details:
   * Contract address
   * Compiler type (single file recommended)
   * Compiler version (must match deployment)
   * Open-source license
   * Optimization settings (if used during deployment)
5. If your contract has constructor arguments:
   * Generate ABI-encoded arguments at e.g. [HashEx](https://abi.hashex.org/)
   * Paste them in the Constructor Arguments field
6. Complete the captcha and submit

## Method 4: Flattened Source

For contracts with complex dependencies that fail standard verification:

1. Install Hardhat flattener:

```bash
npm install --save-dev hardhat-flattener
```

2. Flatten your contract:

```bash
npx hardhat flatten contracts/YourContract.sol > flattened.sol
```

3. Clean up the flattened file:
   * Keep only one SPDX license identifier
   * Keep only one pragma statement
   * Use this file for manual verification

## Method 5: Foundry Verify (Etherscan-compatible)

On Sonic testnet, Sourcify may not support chain 14601. Use the Etherscan-compatible API from SonicScan with Foundry:

1. Set API key in `.env` (optional if not required by the API):

```
ETHERSCAN_API_KEY=your_sonicscan_api_key
```

2. Run Foundry script with custom verifier settings:

```bash
forge script script/DeployAndSave.s.sol:DeployAndSaveScript \
  --rpc-url https://rpc.testnet.soniclabs.com \
  --broadcast \
  --verify \
  --verifier etherscan \
  --verifier-url https://api-testnet.sonicscan.org/api
```

Notes:
- Ensure compiler version and optimizer settings match deployment (see foundry.toml)
- If verification still fails, fall back to Hardhat (Method 1) or Manual (Method 3)

## Troubleshooting

Common verification issues to check:

* Compiler version must match deployment exactly
* Optimization settings must match deployment
* Constructor arguments must be correctly ABI-encoded
* Library addresses must be provided if used
* Source code must match deployed bytecode exactly
* Flattened files should not have duplicate SPDX/pragma statements
