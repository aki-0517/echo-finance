# Lybra Finance MVP on Sonic

Sonic チェーン上で動作する担保型ステーブルコイン（eSUSD）発行プロトコルのMVP実装。

## 🚀 クイックスタート

### 1. 環境設定

```bash
# 環境変数ファイルをコピー
cp contract/.env.example contract/.env
cp web/.env.example web/.env

# contract/.env を編集
PRIVATE_KEY=your_private_key_here

# web/.env を編集（WalletConnect Project IDを取得）
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. コントラクトのデプロイ

```bash
cd contract/
forge build
forge test
forge script script/DeployAndSave.s.sol --rpc-url https://rpc.sonic.test --broadcast
```

### 3. フロントエンドの起動

```bash
cd web/
npm install
npm run dev
```

## 📁 プロジェクト構成

```
lybra/
├── contract/           # Foundryベースのスマートコントラクト
│   ├── src/           # コントラクトソースコード
│   ├── test/          # テストファイル
│   └── script/        # デプロイスクリプト
├── web/               # React + TypeScript フロントエンド
│   └── src/
│       ├── components/    # UIコンポーネント
│       ├── store/        # Zustand状態管理
│       └── contracts/    # コントラクト設定
└── docs/              # プロジェクト仕様書（日本語）
```

## 🔧 主要機能

### スマートコントラクト
- **VaultManager**: 担保管理・ミント・バーン・清算
- **CollateralAdapter**: S/stS価格オラクル統合
- **Stablecoin**: eSUSD ERC20トークン

### フロントエンド
- **ウォレット接続**: RainbowKit統合
- **担保預入**: S/stS トークン対応
- **ステーブル発行**: eSUSD ミント機能
- **清算機能**: 不健全なVaultの清算
- **リアルタイム監視**: Health Factor表示

## 📊 プロトコル設定

- **MCR (最小担保比率)**: 150%
- **最大LTV**: 66.67%
- **清算割引**: 5%
- **対応担保**: S トークン、stS トークン
- **stS交換レート**: ~1.1 S（ステーキング報酬分）

## 🧪 テスト

```bash
# コントラクトテスト
cd contract/
forge test

# フロントエンドテスト（今後追加予定）
cd web/
npm test
```

## 🚢 デプロイメント

デプロイスクリプトは自動的に：
1. Mock価格フィード、SトークンとstSトークンをデプロイ
2. CollateralAdapter、Stablecoin、VaultManagerをデプロイ
3. コントラクト間の接続を設定
4. テスト用トークンをデプロイヤーにミント
5. アドレスを`.env`ファイルに自動保存

## 🌐 ネットワーク情報

- **Sonic Testnet**
  - RPC: `https://rpc.sonic.test`
  - Explorer: `https://explorer.sonic.test`
  - Chain ID: `14601`

## 📝 ライセンス

UNLICENSED（開発用）