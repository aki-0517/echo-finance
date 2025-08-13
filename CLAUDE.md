# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Sonic chain-based Lybra Finance MVP - a collateralized stablecoin protocol that allows users to deposit S or stS as collateral and mint eSUSD stablecoin. The project consists of two main components:

- **Smart Contracts** (`contract/`): Foundry-based Solidity contracts for vault management, collateral handling, and liquidations
- **Frontend** (`web/`): React + TypeScript + Vite application for user interaction

## Development Commands

### Environment Setup
```bash
# Copy environment files and configure
cp contract/.env.example contract/.env
cp web/.env.example web/.env

# Edit .env files with your configuration:
# - PRIVATE_KEY: Your private key for deployment
# - VITE_WALLETCONNECT_PROJECT_ID: Get from WalletConnect Cloud
```

### Smart Contract Development (contract/)
```bash
cd contract/
forge build                    # Build contracts
forge test                     # Run all tests  
forge test --match-test testName # Run specific test
forge fmt                      # Format Solidity code
forge snapshot                 # Generate gas snapshots
anvil                          # Start local Ethereum node

# Deploy to Sonic Testnet (auto-saves addresses to .env)
forge script script/DeployAndSave.s.sol --rpc-url https://rpc.sonic.test --broadcast --verify
```

### Frontend Development (web/)
```bash
cd web/
npm run dev                    # Start development server
npm run build                  # Build for production (runs tsc -b && vite build)
npm run lint                   # Run ESLint
npm run preview               # Preview production build
```

## Architecture Overview

### Smart Contract Architecture
The protocol implements a collateral-based stablecoin system with three main contracts:

1. **VaultManager.sol** - Core vault management, handles deposits, withdrawals, minting, burning, and liquidations
2. **CollateralAdapter.sol** - Price oracle integration for S and stS tokens with exchange rate handling
3. **Stablecoin.sol (eSUSD)** - ERC20 stablecoin with mint/burn permissions restricted to VaultManager

Key parameters:
- MCR (Minimum Collateral Ratio): 150%
- Maximum LTV: 66% (100/150)
- Liquidation discount: 5%

### Frontend Architecture
- **Framework**: React 19 + TypeScript + Vite
- **Wallet Integration**: Uses wagmi + RainbowKit pattern (to be implemented)
- **UI Framework**: Tailwind CSS + shadcn/ui (to be implemented)
- **Charts**: recharts (to be implemented)

Current structure is minimal Vite + React template that needs expansion for DeFi functionality.

## Development Workflow

### Contract Development
1. Implement contracts in `contract/src/`
2. Write tests in `contract/test/` using Foundry's testing framework
3. Use `forge test` to verify functionality
4. Deploy scripts go in `contract/script/`

### Frontend Development  
1. Components should go in `web/src/components/`
2. Key components to implement:
   - `VaultSummaryCard.tsx` - Dashboard vault overview
   - `CollateralModal.tsx` - Deposit S/stS collateral
   - `MintModal.tsx` - Mint eSUSD stablecoin
   - `RepayModal.tsx` - Repay/burn eSUSD
   - `WithdrawModal.tsx` - Withdraw collateral
   - `LiquidationList.tsx` - View liquidatable positions
   - `HealthFactorBar.tsx` - Visual health factor indicator

### Testing Strategy
- Smart contracts: Use Foundry's test framework with comprehensive unit and integration tests
- Frontend: Testing framework to be determined (likely Vitest given Vite setup)

## Key Features to Implement

### Smart Contracts
- Vault system supporting both S and stS collateral
- Price oracle integration with Chainlink/Redstone
- Liquidation engine with 5% discount mechanism
- Security measures: ReentrancyGuard, SafeERC20, oracle staleness checks

### Frontend
- Multi-collateral deposit interface (S/stS toggle)
- Real-time LTV and health factor calculations
- Liquidation interface for liquidators
- Mobile-responsive design
- Integration with Sonic testnet

## Target Network
- **Primary**: Sonic Testnet

The project documentation in `docs/` contains detailed Japanese specifications for the MVP implementation plan and product requirements.