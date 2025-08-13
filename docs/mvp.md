
# Sonic版 Lybra Finance MVP - プロダクト仕様書

## 🎯 プロダクト概要
Sonicチェーン上で **S または stS を担保**にし、利回りを活用したステーブルコイン **eSUSD** を発行するプロトコルのMVP版。  
EthereumのLybra Financeを参考に、最小限の担保管理・ステーブル発行・清算機能のみ実装。

---

## 🏆 目的
- Sonicエコシステム内で担保型ステーブルコインの発行を可能にする
- stSの利回りを基盤とした金利フリーの貸出モデルを試験
- 将来のPendle型や安定性プール拡張の土台を構築

---

## 📦 MVP機能
1. **担保デポジット**
   - S または stS をVaultにロック
   - stSは利回りが付くため担保効率が高い
2. **ステーブル発行 (Mint)**
   - 担保評価額の最大 66% までeSUSDを発行可能（MCR=150%）
3. **返済 (Burn)**
   - eSUSDを返却して負債減少
4. **担保引き出し**
   - 返済後に余剰担保を引き出し
5. **清算**
   - LTV > 150%の場合に誰でも清算可能
   - 清算者は担保を割引価格で取得
6. **価格オラクル**
   - ChainlinkまたはRedstoneでS価格を取得
   - stSはS価格 × exchangeRateで評価

---

## 🛠 コントラクト構成

### 1. VaultManager.sol
- ユーザー別に担保・負債状態を管理
- 入金・引き出し・Mint・Burn・清算機能
- 担保種別（S/stS）の判定
- MCR(150%) とLTV計算ロジック内蔵

主要関数例:
```solidity
function depositCollateral(uint256 amount, bool isStS) external;
function withdrawCollateral(uint256 amount) external;
function mintStable(uint256 amount) external;
function burnStable(uint256 amount) external;
function liquidate(address user) external;
````

### 2. CollateralAdapter.sol

* S と stS の価格をオラクル経由で取得
* stSのexchangeRateを反映して担保価値を算出

### 3. Stablecoin.sol (eSUSD)

* ERC20準拠
* Mint/Burn権限はVaultManagerのみ

### 4. LiquidationEngine.sol

* 清算条件判定
* 割引率適用で担保引き渡し
* MVPでは直接清算のみ、オークションや安定性プールは未実装

---

## 💻 UI設計

### 1. ダッシュボード

* ユーザーの担保価値 / 負債 / LTV / Health Factor を表示
* 「担保追加」「Mint」「返済」「引き出し」ボタン

### 2. 担保追加モーダル

* S / stS 切替タブ
* 数量入力 + Maxボタン
* LTV・Health Factorのリアルタイム更新

### 3. Mintモーダル

* 発行額入力
* 発行可能最大額と安全マージン表示
* 発行後のLTV計算

### 4. 返済モーダル

* 返済額入力
* 返済後のLTV表示

### 5. 清算ページ

* 清算可能なポジション一覧
* 清算ボタン

---

## 🎨 デザイン指針

* カラー: Sonic公式ブルー系、担保安全=グリーン、危険=レッド
* Health Factor: カラーバーで視覚的に表示
* モバイル対応: カード式UI + モーダル全画面

---

## 🧑‍💻 技術スタック

* **スマートコントラクト**: Solidity ^0.8.x, Foundry
* **フロントエンド**: Vite + React + Tailwind CSS + viem/wagmi
* **ウォレット接続**: wagmi + RainbowKit
* **グラフ表示**: recharts
* **オラクル**: Chainlink / Redstone
* **ネットワーク**: Sonic Testnet

---

## 🚀 ユーザーフロー

1. ウォレット接続
2. S / stS を担保にデポジット
3. eSUSD をMint
4. eSUSDをDeFi利用または返済
5. 必要に応じて担保引き出し
6. LTV悪化時は清算可能

---

## 📌 MVPスコープ外

* 安定性プール
* 複数担保種追加
* ガバナンス機構
* ペグ維持のための自動LP管理
* クロスチェーンブリッジ
