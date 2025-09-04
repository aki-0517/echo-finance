# Echo Finance (on Sonic)

MVP implementation of a collateralized stablecoin (eSUSD) issuance protocol operating on the Sonic chain.

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment variable files
cp contract/.env.example contract/.env
cp web/.env.example web/.env

# Edit contract/.env
PRIVATE_KEY=your_private_key_here

# Edit web/.env (Get WalletConnect Project ID)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. Contract Deployment

```bash
cd contract/
forge build
forge test
forge script script/DeployAndSave.s.sol --rpc-url https://rpc.sonic.test --broadcast
```

### 3. Frontend Launch

```bash
cd web/
npm install
npm run dev
```

## 📁 Project Structure

```
lybra/
├── contract/           # Foundry-based smart contracts
│   ├── src/           # Contract source code
│   ├── test/          # Test files
│   └── script/        # Deployment scripts
├── web/               # React + TypeScript frontend
│   └── src/
│       ├── components/    # UI components
│       ├── store/        # Zustand state management
│       └── contracts/    # Contract configuration
└── docs/              # Project specifications (Japanese)
```

## 🔧 Key Features

### Smart Contracts
- **VaultManager**: Collateral management, minting, burning, liquidations
- **CollateralAdapter**: S/stS price oracle integration
- **Stablecoin**: eSUSD ERC20 token

### Frontend
- **Wallet Connection**: RainbowKit integration
- **Collateral Deposit**: S/stS token support
- **Stablecoin Issuance**: eSUSD minting functionality
- **Liquidation Features**: Liquidation of unhealthy vaults
- **Real-time Monitoring**: Health Factor display

## 📊 Protocol Configuration

- **MCR (Minimum Collateral Ratio)**: 150%
- **Maximum LTV**: 66.67%
- **Liquidation Discount**: 5%
- **Supported Collateral**: S tokens, stS tokens
- **stS Exchange Rate**: ~1.1 S (staking rewards included)

## 🧪 Testing

```bash
# Contract testing
cd contract/
forge test

# Frontend testing (to be added in future)
cd web/
npm test
```

## 🚢 Deployment

The deployment script automatically:
1. Deploys Mock price feeds, S tokens and stS tokens
2. Deploys CollateralAdapter, Stablecoin, VaultManager
3. Sets up connections between contracts
4. Mints test tokens to the deployer
5. Automatically saves addresses to `.env` file

## 📋 Contract Addresses (Sonic Testnet)

- **MockSToken (S)**: `0x8ffa6dcd633e3de633bb2d12b528ae82df189f2c`
- **MockStSToken (stS)**: `0x279ec875d8b0cc18783b2451121b18c8ce9626f6`
- **CollateralAdapter**: `0xc3a9d70a76df1459ac259d460cd6781e86620a45`
- **Stablecoin (eSUSD)**: `0xd519048928cfd8d2588e352d0cb7e095b25be6a6`
- **VaultManager**: `0x6136a19a0f2dec456777eef274fba34437b7b689`

## 🌐 Network Information

- **Sonic Testnet**
  - RPC: `https://rpc.testnet.soniclabs.com`
  - Explorer: `https://explorer.sonic.test`
  - Chain ID: `14601`
  - Faucet: Available through official Sonic Discord

## 📝 License

UNLICENSED (for development)