---
marp: true
theme: default
class: lead
paginate: true
style: |
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');
  
  section {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    background: linear-gradient(135deg, #210B05 0%, #572D24 100%);
    color: #FFFFFF;
    padding: 60px;
  }
  
  section.title {
    background: linear-gradient(135deg, #210B05 0%, #572D24 100%);
  }
  
  h1 {
    font-size: 56px;
    font-weight: 500;
    color: #FFFFFF;
    margin-bottom: 0.5em;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  h2 {
    font-size: 48px;
    font-weight: 500;
    color: #FBC67E;
    margin-bottom: 0.8em;
  }
  
  h3 {
    font-size: 32px;
    font-weight: 500;
    color: #FFFFFF;
    margin-bottom: 0.5em;
  }
  
  ul {
    list-style: none;
    padding-left: 0;
  }
  
  li {
    margin: 0.8em 0;
    padding-left: 1.5em;
    position: relative;
  }
  
  li:before {
    content: "▸";
    color: #FBC67E;
    position: absolute;
    left: 0;
    font-weight: bold;
  }
  
  strong {
    color: #FBC67E;
  }
  
  .features {
    background: linear-gradient(135deg, #FF9401 0%, #DF5F28 100%);
  }
  
  section::after {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #FBC67E;
  }
---

<!-- _class: title -->

<style scoped>
.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
}
.title-text {
  text-align: left;
}
.logo {
  width: 180px;
  height: 180px;
  object-fit: contain;
}
</style>

<div class="title-container">
  <div class="title-text">
    <h1>Echo Finance</h1>
    <p><strong>Collateralized Stablecoin Protocol on Sonic</strong></p>
  </div>
  <img src="../../web/public/logo.png" alt="Echo Finance Logo" class="logo">
</div>

---

## The Problem

- **Limited stablecoin options** on Sonic ecosystem
- **Underutilized yield opportunities** from stS tokens
- **Capital inefficiency** in current DeFi protocols
- **Missing infrastructure** for collateral-backed lending

---

## Our Solution

**eSUSD**: A yield-backed stablecoin protocol

**Multi-collateral support** - Accept both S and stS
**Yield optimization** - Leverage stS rewards for interest-free loans
**Capital efficiency** - 150% MCR (66% max LTV)
**Automated liquidations** - 5% discount incentive

---

## How It Works

### **Deposit Collateral**
Lock S or stS tokens in secure vault
stS provides enhanced efficiency via staking rewards

### **Mint eSUSD**
Borrow up to 66% of collateral value
Interest-free loans backed by staking yield

### **Manage Position**
Repay eSUSD to reduce debt
Withdraw excess collateral safely
Monitor health factor in real-time

---

<!-- _class: features -->

## MVP Features

### **Core Vault System**
VaultManager.sol for position management
CollateralAdapter.sol for price oracles
eSUSD.sol stablecoin contract

### **Security & Reliability**
Battle-tested liquidation engine
ReentrancyGuard protection
Oracle staleness checks

---

<!-- _class: title -->

## Target Network

**Sonic Testnet** → **Sonic Mainnet**

*Building the foundation for Sonic's DeFi ecosystem*