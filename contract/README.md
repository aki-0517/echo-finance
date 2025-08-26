# Echo Finance MVP - Smart Contracts

Smart contract implementation of a collateralized stablecoin (eSUSD) issuance protocol operating on the Sonic chain.

## 🏗️ Contract Architecture

- **VaultManager.sol**: Core functionality for collateral management, minting, burning, liquidations
- **CollateralAdapter.sol**: S/stS price oracle integration and exchange rate processing  
- **Stablecoin.sol**: eSUSD ERC20 token implementation
- **Test contracts**: Comprehensive test suite

## 🚀 Sonic Testnet Deployment Guide

### 1. Environment Setup

```bash
# Copy environment variable file
cp .env.example .env

# Edit .env file
nano .env
```

Configure the following in `.env` file:
```bash
# Required: Private key for deployment (64-digit hex with 0x prefix)
PRIVATE_KEY=0xyour_private_key_here

# Sonic Testnet RPC URL
RPC_URL=https://rpc.testnet.soniclabs.com

# Optional: Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 2. Install Dependencies

```bash
# Install OpenZeppelin contracts
forge install OpenZeppelin/openzeppelin-contracts
```

### 3. Compile & Test

```bash
# Compile contracts
forge build

# Run tests (all 12 tests must pass)
forge test

# Check gas usage
forge snapshot

# Format code
forge fmt
```

### 4. Deploy to Sonic Testnet

```bash
# Load environment variables to shell (if needed)
set -a; source .env; set +a

# Execute deployment (auto-save addresses, no verification)
forge script script/DeployAndSave.s.sol:DeployAndSaveScript \
  --rpc-url $RPC_URL \
  --broadcast

# Or specify environment variables directly (no verification)
forge script script/DeployAndSave.s.sol:DeployAndSaveScript \
  --rpc-url https://rpc.testnet.soniclabs.com \
  --broadcast

# Dry run (fork simulation, no broadcast)
forge script script/DeployAndSave.s.sol:DeployAndSaveScript \
  --fork-url https://rpc.testnet.soniclabs.com
```

### 5. Verify Deployment Results

After successful deployment, the following occurs automatically:

1. **Contract Address Saving**: Addresses are automatically recorded in `.env` file
2. **Frontend Configuration Update**: `../web/.env` file is also automatically updated
3. **Test Token Minting**: 1000 S and 1000 stS tokens are minted to deployer address

```bash
# Check deployment results
cat .env

# Check frontend configuration
cat ../web/.env
```

## 🌐 Sonic Testnet Information

- **Chain ID**: 14601
- **RPC URL**: `https://rpc.testnet.soniclabs.com`
- **Explorer**: `https://explorer.sonic.test`
- **Faucet**: Available through official Sonic Discord

## 📋 Deployed Contracts

1. **MockPriceFeed**: Test price oracle (S = $2000)
2. **MockSToken**: Test S token
3. **MockStSToken**: Test stS token (exchange rate = 1.1)
4. **CollateralAdapter**: Price fetching and exchange rate processing
5. **Stablecoin (eSUSD)**: Stablecoin ERC20
6. **VaultManager**: Main protocol logic

## 🧪 Protocol Parameters

- **MCR (Minimum Collateral Ratio)**: 150%
- **Maximum LTV**: 66.67%
- **Liquidation Discount**: 5%
- **S Price**: $2,000 (fixed test value)
- **stS exchange rate**: 1.1 S

## 🔍 Contract Verification

When Etherscan API Key is configured, contracts are automatically verified during deployment.

For manual verification:
```bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --rpc-url $RPC_URL
```

## 🛠️ Development Commands

```bash
# Start local testnet
anvil

# Run specific test
forge test --match-test testLiquidation

# Test with detailed logs
forge test -vv

# Gas optimization report
forge test --gas-report

# Coverage report
forge coverage
```

## ⚠️ Important Notes

1. **Private Key Management**: Never commit the `.env` file to version control
2. **Test Only**: This deployment script uses Mock contracts for testing
3. **Production Use**: Use actual oracle and token addresses in production environment
4. **Gas Fees**: Sonic Testnet gas tokens are available through Discord

## 🔗 Related Links

- [Foundry Documentation](https://book.getfoundry.sh/)
- [Sonic Labs Documentation](https://docs.soniclabs.com/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 📝 Troubleshooting

### Common Issues and Solutions

**Q: "insufficient funds" error during deployment**
A: Get Sonic Testnet gas tokens through Discord

**Q: Verification errors occur**  
A: Check if Etherscan API Key is correctly configured

**Q: Tests fail**
A: Check if OpenZeppelin contracts are installed:
```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

**Q: RPC connection error**
A: Check if RPC_URL in `.env` file is correctly configured

**Q: "a value is required for '--fork-url <URL>'" message appears**
A: Use `--rpc-url` for deployment. `--fork-url` is for dry runs (simulation). If `FOUNDRY_FORK_URL` remains in environment, unset it:
```bash
unset FOUNDRY_FORK_URL
```
Also, it's recommended to append `:DeployAndSaveScript` to the script name to specify the target explicitly (refer to deployment instructions in README).

## 🔗 Chainlink Price Feed Auto-Update Configuration

### Using Chainlink Aggregator on Sonic Testnet

This protocol is fully compatible with Chainlink price feeds. Once configured, it automatically fetches the latest prices without manual updates.

#### For New Deployments (Recommended)

1. **Pre-configure Chainlink Address**
```bash
# Edit .env file
nano .env

# Set Chainlink Aggregator address for Sonic testnet
PRICE_FEED_ADDRESS=0x[Chainlink_Aggregator_Address]
```

2. **Execute Chainlink-Compatible Deployment**
```bash
# Deploy using Chainlink (Mock feeds will not be created)
forge script script/DeployAndSave.s.sol:DeployAndSaveScript \
  --rpc-url $RPC_URL \
  --broadcast -vvvv
```

#### Migration Process for Existing Deployments

If existing CollateralAdapter is using Mock feeds, it can be switched to Chainlink:

1. **Migration Environment Configuration**
```bash
# Add configuration to .env file
PRIVATE_KEY=0x...                    # CollateralAdapter owner private key
RPC_URL=https://rpc.testnet.soniclabs.com
COLLATERAL_ADAPTER_ADDRESS=0x...     # Existing adapter address
PRICE_FEED_ADDRESS=0x...             # Chainlink Aggregator address
```

2. **Switch to Chainlink Price Feed**
```bash
# Change existing adapter feed to Chainlink
forge script script/SetPriceFeed.s.sol:SetPriceFeedScript \
  --rpc-url $RPC_URL \
  --broadcast -vvvv
```

#### Behavior After Configuration

✅ **Automatic Price Updates**: Chainlink updates prices on-chain  
✅ **No Manual Updates Required**: No need for replacement or setPrice calls  
✅ **Freshness Check**: Only accepts data within 1 hour (`STALENESS_THRESHOLD`)  
✅ **High Reliability**: Utilizes Chainlink's decentralized oracle network  

#### Available Chainlink Feeds

Examples of Chainlink Aggregators available on Sonic testnet:
- SOL/USD: `0x[address]` 
- ETH/USD: `0x[address]`
- BTC/USD: `0x[address]`

※Check Sonic official documentation or Chainlink official site for specific addresses

### Price Feed is Stale and UI Total Collateral Shows $0.00 (Traditional Mock Method)

**Cause**: `CollateralAdapter.getSPrice()` reverts with `"Price data is stale"` when update time is more than 1 hour ago.

**Solution 1: Migrate to Chainlink (Recommended)**
Follow the Chainlink configuration steps above to migrate to Chainlink Aggregator.

**Solution 2: Continue Using Mock Feed**
No redeployment needed. Deploy a new mock price feed for existing `CollateralAdapter` and replace it with `setPriceFeed` to resolve the issue.

1) Preparation (.env)
```bash
PRIVATE_KEY=0x...                  # CollateralAdapter owner key
RPC_URL=https://rpc.testnet.soniclabs.com
COLLATERAL_ADAPTER_ADDRESS=0x...   # Saved to .env when DeployAndSave executed
```

2) Replace Price Feed (No Redeployment Required)
```bash
forge script script/UpdatePriceFeed.s.sol:UpdatePriceFeedScript \
  --rpc-url $RPC_URL \
  --broadcast -vvvv
```

3) Update Price (Run Periodically to Avoid Staleness)
- Update price (e.g., $2100, 8 decimals for Chainlink compatibility)
```bash
cast send <NEW_FEED_ADDRESS> 'setPrice(int256)' 2100e8 \
  --private-key $PRIVATE_KEY --rpc-url $RPC_URL
```

Notes
- `setPriceFeed` is `onlyOwner`. Execute with `CollateralAdapter` owner key.
- Frontend adapter address doesn't change, so `Total Collateral` displays correctly immediately after replacement.