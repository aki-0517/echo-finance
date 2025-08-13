# Lybra Finance MVP - Smart Contracts

Sonic チェーン上で動作する担保型ステーブルコイン（eSUSD）発行プロトコルのスマートコントラクト実装。

## 🏗️ コントラクト構成

- **VaultManager.sol**: 担保管理・ミント・バーン・清算の中核機能
- **CollateralAdapter.sol**: S/stS価格オラクル統合とexchange rate処理  
- **Stablecoin.sol**: eSUSD ERC20トークン実装
- **Test contracts**: 包括的なテストスイート

## 🚀 Sonic Testnet デプロイ手順

### 1. 環境設定

```bash
# 環境変数ファイルをコピー
cp .env.example .env

# .envファイルを編集
nano .env
```

`.env`ファイルに以下を設定:
```bash
# 必須: デプロイ用秘密鍵（0x付きの64桁16進数）
PRIVATE_KEY=0xyour_private_key_here

# Sonic Testnet RPC URL
RPC_URL=https://rpc.testnet.soniclabs.com

# オプション: Etherscan API Key（コントラクト検証用）
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 2. 依存関係インストール

```bash
# OpenZeppelin contractsインストール
forge install OpenZeppelin/openzeppelin-contracts
```

### 3. コンパイル & テスト

```bash
# コントラクトコンパイル
forge build

# テスト実行（全12テストが通過する必要があります）
forge test

# ガス使用量チェック
forge snapshot

# コードフォーマット
forge fmt
```

### 4. Sonic Testnetにデプロイ

```bash
# シェルに環境変数を読み込む（必要な場合）
set -a; source .env; set +a

# デプロイ実行（アドレス自動保存・検証なし）
forge script script/DeployAndSave.s.sol:DeployAndSaveScript \
  --rpc-url $RPC_URL \
  --broadcast

# または環境変数を直接指定（検証なし）
forge script script/DeployAndSave.s.sol:DeployAndSaveScript \
  --rpc-url https://rpc.testnet.soniclabs.com \
  --broadcast

# ドライラン（フォークでシミュレーション、ブロードキャストなし）
forge script script/DeployAndSave.s.sol:DeployAndSaveScript \
  --fork-url https://rpc.testnet.soniclabs.com
```

### 5. デプロイ結果確認

デプロイ成功後、以下が自動実行されます:

1. **コントラクトアドレス保存**: `.env`ファイルにアドレスが自動記録
2. **フロントエンド設定更新**: `../web/.env`ファイルも自動更新
3. **テストトークンミント**: デプロイヤーアドレスに1000 S、1000 stSがミント

```bash
# デプロイ結果確認
cat .env

# フロントエンド用設定確認
cat ../web/.env
```

## 🌐 Sonic Testnet情報

- **Chain ID**: 14601
- **RPC URL**: `https://rpc.testnet.soniclabs.com`
- **Explorer**: `https://explorer.sonic.test`
- **Faucet**: Sonic公式Discordで入手可能

## 📋 デプロイされるコントラクト

1. **MockPriceFeed**: テスト用価格オラクル（S = $2000）
2. **MockSToken**: テスト用Sトークン
3. **MockStSToken**: テスト用stSトークン（exchange rate = 1.1）
4. **CollateralAdapter**: 価格取得とexchange rate処理
5. **Stablecoin (eSUSD)**: ステーブルコインERC20
6. **VaultManager**: メインプロトコルロジック

## 🧪 プロトコルパラメータ

- **MCR (最小担保比率)**: 150%
- **最大LTV**: 66.67%
- **清算割引**: 5%
- **S価格**: $2,000（テスト用固定値）
- **stS exchange rate**: 1.1 S

## 🔍 コントラクト検証

Etherscan API Keyが設定されている場合、デプロイ時に自動でコントラクトが検証されます。

手動検証の場合:
```bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --rpc-url $RPC_URL
```

## 🛠️ 開発用コマンド

```bash
# ローカルテストネット起動
anvil

# 特定テスト実行
forge test --match-test testLiquidation

# 詳細ログ付きテスト
forge test -vv

# ガス最適化レポート
forge test --gas-report

# カバレッジレポート
forge coverage
```

## ⚠️ 注意事項

1. **秘密鍵管理**: `.env`ファイルは絶対にコミットしないでください
2. **テスト専用**: このデプロイスクリプトはテスト用のMockコントラクトを使用します
3. **プロダクション利用**: 本番環境では実際のオラクルとトークンアドレスを使用してください
4. **ガス料金**: Sonic TestnetのガストークンはDiscordで取得可能です

## 🔗 関連リンク

- [Foundry Documentation](https://book.getfoundry.sh/)
- [Sonic Labs Documentation](https://docs.soniclabs.com/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 📝 トラブルシューティング

### よくある問題と解決方法

**Q: デプロイ時に "insufficient funds" エラー**
A: Sonic TestnetのガストークンをDiscordで取得してください

**Q: 検証エラーが発生**  
A: Etherscan API Keyが正しく設定されているか確認してください

**Q: テストが失敗する**
A: OpenZeppelin contractsがインストールされているか確認:
```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

**Q: RPC接続エラー**
A: `.env`ファイルのRPC_URLが正しく設定されているか確認してください

**Q: "a value is required for '--fork-url <URL>'" と表示される**
A: デプロイ時は `--rpc-url` を使用してください。`--fork-url` はドライラン（シミュレーション）用です。環境に `FOUNDRY_FORK_URL` が残っている場合は以下で解除してください。
```bash
unset FOUNDRY_FORK_URL
```
また、スクリプト名の末尾に `:DeployAndSaveScript` を付けてターゲットを明示することを推奨します（READMEのデプロイ手順参照）。