# Sonic版 Lybra Finance MVP 実装計画書

## 📌 プロジェクト概要

Sonicチェーン上で **S または stS を担保** にし、ステーブルコイン **eSUSD** を発行する最小限の担保型ステーブルプロトコル。

* EthereumのLybra Financeを簡略化
* **担保ロック → ステーブル発行 → 清算** の基本フローのみ実装
* 将来的な拡張（安定性プール、Pendle型など）を考慮した構造

---

## 1. 🛠 スマートコントラクト設計

### 1.1 コントラクト構成

```
contracts/
 ├── VaultManager.sol         // 担保・負債管理、Mint/Burn、清算
 ├── CollateralAdapter.sol    // S & stS 価格取得
 ├── Stablecoin.sol           // eSUSD ERC20
 └── interfaces/
     ├── IPriceFeed.sol
     ├── IERC20.sol
```

---

### 1.2 コントラクト詳細

#### **VaultManager.sol**

* 機能:

  * `depositCollateral(uint256 amount, bool isStS)`
  * `withdrawCollateral(uint256 amount)`
  * `mintStable(uint256 amount)`
  * `burnStable(uint256 amount)`
  * `liquidate(address user)`

* データ構造:

```solidity
struct Vault {
    uint256 collateralS;
    uint256 collateralStS;
    uint256 debt;
}
mapping(address => Vault) public vaults;
```

* LTV計算:

```solidity
function getCollateralValue(address user) public view returns (uint256);
function getLTV(address user) public view returns (uint256);
```

* MCR設定: 150%（1.5倍）

---

#### **CollateralAdapter.sol**

* Chainlink / Redstone 経由で S のUSD価格取得
* stSの場合は `S価格 * exchangeRate` で評価
* `getCollateralUSDValue(address user)` をVaultManagerから呼び出し

---

#### **Stablecoin.sol (eSUSD)**

* ERC20
* Mint / Burn はVaultManagerのみ実行可能
* 小数点18桁

---

#### **Liquidationロジック（VaultManager内）**

* 判定: `collateralValue < debt * MCR`
* 清算時、清算者が担保を**5%割引価格**で取得
* MVPでは担保直接移転（オークションなし）

---

### 1.3 セキュリティ簡易対策

* ReentrancyGuard
* SafeERC20
* オラクル価格の更新チェック（stale block防止）
* 管理者権限: マルチシグ or timelock

---

## 2. 💻 フロントエンド設計

### 2.1 技術スタック

* **Framework**: Vite + React + TypeScript + Viem/wagmi
* **Wallet**: wagmi + RainbowKit
* **UI**: Tailwind CSS + shadcn/ui
* **Graph**: recharts
* **State**: Zustand

---

### 2.2 ページ構成

#### `/` (Dashboard)

* ウォレット接続
* 担保総額（USD）
* 負債額（eSUSD）
* Health Factor（バー表示）
* LTV%
* ボタン: 「担保追加」「Mint」「返済」「引き出し」

#### `/liquidations`

* 清算可能ポジション一覧
* 清算ボタン

---

### 2.3 コンポーネント一覧

* `VaultSummaryCard.tsx`
* `CollateralModal.tsx`
* `MintModal.tsx`
* `RepayModal.tsx`
* `WithdrawModal.tsx`
* `LiquidationList.tsx`
* `HealthFactorBar.tsx`

---

### 2.4 UI仕様

* **担保追加モーダル**

  * S / stS 切替
  * 数量入力 + Maxボタン
  * LTVリアルタイム更新
* **Mintモーダル**

  * 発行額入力
  * 発行可能上限表示
  * 発行後のLTV表示
* **返済モーダル**

  * 返済額入力
  * 返済後LTV表示

---

## 3. 🚀 実装タスク

### 3.1 コントラクト開発 (Foundry) - contract/配下のfileを編集実装

1. `Stablecoin.sol` 実装
2. `CollateralAdapter.sol` 実装
3. `VaultManager.sol` 実装
4. 単体テスト作成
5. デプロイスクリプト作成（Sonic Testnet）

### 3.2 フロント開発 - web/配下のfileを編集実装

1. wagmi + RainbowKit セットアップ
2. `VaultSummaryCard` 実装
3. 各モーダル（担保追加/Mint/返済/引き出し）実装
4. `LiquidationList` 実装
5. オラクル価格表示ロジック実装
6. スマホUI調整

### 3.3 デプロイ & 検証

1. コントラクトをSonic Testnetへデプロイ
2. フロントエンドのcontract address更新
3. テストユーザーでDeposit→Mint→Burn→Withdraw→Liquidateの動作確認
4. GitHub Actionsで自動ビルド設定

---

## 4. 🗂 ディレクトリ構成例

```
project/
 ├── contracts/
 │    ├── VaultManager.sol
 │    ├── CollateralAdapter.sol
 │    ├── Stablecoin.sol
 │    └── interfaces/
 ├── frontend/
 │    ├── src/
 │    │    ├── components/
 │    │    ├── pages/
 │    │    └── hooks/
 ├── scripts/
 │    ├── deploy.ts
 ├── test/
 │    ├── VaultManager.t.sol
 │    ├── CollateralAdapter.t.sol
 │    └── Stablecoin.t.sol
 └── README.md
```

---

## 5. ✅ 完了条件

* [ ] Sonic Testnet上で担保ロック→eSUSD発行→返済→清算まで可能
* [ ] UI上で担保とLTVが正しく表示される
* [ ] stSのexchangeRate反映済み
* [ ] 最低限の安全対策（ReentrancyGuard / SafeERC20）実装
* [ ] GitHubにソースコード + デプロイアドレス記載

