MVP で **「担保ロック → ステーブル発行 → 清算」** という最小限の流れだけ実装する形が良いです。

Ethereum の Lybra の仕組みをシンプル化して Sonic 向けに落とすと、コントラクト構成はこんな感じになります。

---

## **MVP版コントラクト設計**

### 1. **VaultManager**

* ユーザー単位の担保管理と負債管理を担当
* 入出金関数：

  ```solidity
  function depositCollateral(uint256 amount, bool isStS) external;
  function withdrawCollateral(uint256 amount) external;
  ```
* 借入/返済関数：

  ```solidity
  function mintStable(uint256 amount) external;
  function burnStable(uint256 amount) external;
  ```
* 清算関数：

  ```solidity
  function liquidate(address user) external;
  ```
* LTV（担保率）チェック機構
* stS の場合は利回りを自動集計するための`yieldCollector`と接続

---

### 2. **CollateralTokenAdapter**

* S と stS を区別して担保価値を取得
* Chainlink/Redstone の価格フィードを参照して担保評価額を計算
* stS の場合は `stSPrice = SPrice * exchangeRate` 形式で取得（自然に価値が増える）

---

### 3. **Stablecoin (eSUSD)**

* 標準 ERC20
* Mint / Burn は **VaultManager** のみが可能
* 将来的に AMM と統合可能な仕様にする

---

### 4. **LiquidationEngine**

* 清算条件: `collateralValue < debt * MCR`
* 清算者は担保を割引価格（例: 5%）で取得
* 清算時に安定性プール（StabilityPool）やオークションを省き、MVPでは直接担保引き渡し

---

### 5. **YieldCollector**（オプション）

* stS の利回りをプロトコルが収集
* プロトコル収益として保管、後で配分や buyback に利用
* MVPでは単純に Vault に stS を持たせたままにしておき、ユーザー担保が自然に増える仕様でもOK

---

## **MVPフロー**

1. **Deposit**

   * ユーザーが S または stS を預ける
   * VaultManager に担保残高記録

2. **Mint**

   * 担保評価額に基づき eSUSD を発行
   * 例：LTV=150% なら、\$150相当の担保で最大 \$100 ミント可

3. **Accrue Yield**

   * stS の価値が日々上昇
   * 担保価値が増えるため、間接的に安全度が上がる

4. **Burn**

   * eSUSD を返却して負債減少
   * 全返済で担保全額引き出し

5. **Liquidate**

   * LTVが閾値を超えた場合、誰でも清算可能

---

## **MVPで外す機能**

* 安定性プール（StabilityPool）
* ペグ維持のためのプロトコルLP
* ガバナンス機能
* 担保種追加のモジュール化
* クロスチェーンブリッジ

---

## **セキュリティ簡易対策**

* リエントランシーガード
* オラクルの価格更新頻度制御
* 最大ミント額の設定
* 管理者権限はマルチシグ or Timelock

---

## **MVPのコントラクト構成図（簡易）**

```
[User]
  | deposit / withdraw
  v
[VaultManager] <-> [CollateralTokenAdapter] <-> [Oracle]
  | mint / burn
  v
[Stablecoin (eSUSD)]
  |
  v
[LiquidationEngine]
```

---

この構成なら、

* Sonic 上で **1つのメインコントラクト（VaultManager）+ eSUSDトークン** を作ればすぐ動かせます
* 将来は **Pendle型のYieldトークン化** や **安定性プール** を後付けできます

