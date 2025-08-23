# Echo Finance MVP - Smart Contracts

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

## 🔗 Chainlink価格フィード自動反映設定

### Sonic TestnetでのChainlink Aggregator使用手順

本プロトコルはChainlink価格フィードと完全互換です。一度設定すれば、手動更新不要で常に最新価格を自動取得できます。

#### 新規デプロイ時（推奨）

1. **Chainlinkアドレスを事前設定**
```bash
# .envファイルを編集
nano .env

# Sonic testnetのChainlink Aggregatorアドレスを設定
PRICE_FEED_ADDRESS=0x[Chainlink_Aggregator_Address]
```

2. **Chainlink対応デプロイ実行**
```bash
# Chainlinkを使用したデプロイ（Mockフィードは作成されません）
forge script script/DeployAndSave.s.sol:DeployAndSaveScript \
  --rpc-url $RPC_URL \
  --broadcast -vvvv
```

#### 既存デプロイの移行手順

既存のCollateralAdapterでMockフィードを使っている場合、Chainlinkに切り替え可能です：

1. **移行用環境設定**
```bash
# .envファイルに追加設定
PRIVATE_KEY=0x...                    # CollateralAdapterのowner秘密鍵
RPC_URL=https://rpc.testnet.soniclabs.com
COLLATERAL_ADAPTER_ADDRESS=0x...     # 既存のアダプターアドレス
PRICE_FEED_ADDRESS=0x...             # Chainlink Aggregatorアドレス
```

2. **Chainlink価格フィードに切り替え**
```bash
# 既存アダプターのフィードをChainlinkに変更
forge script script/SetPriceFeed.s.sol:SetPriceFeedScript \
  --rpc-url $RPC_URL \
  --broadcast -vvvv
```

#### 設定完了後の動作

✅ **自動価格更新**: Chainlinkがオンチェーンで価格を更新  
✅ **手動更新不要**: 差し替えやsetPrice呼び出しが不要  
✅ **鮮度チェック**: 1時間以内のデータのみ受け入れ（`STALENESS_THRESHOLD`）  
✅ **高い信頼性**: Chainlinkの分散型オラクルネットワークを活用  

#### 利用可能なChainlinkフィード

Sonic testnetで利用可能なChainlink Aggregatorの例：
- SOL/USD: `0x[address]` 
- ETH/USD: `0x[address]`
- BTC/USD: `0x[address]`

※具体的なアドレスはSonic公式ドキュメントまたはChainlink公式サイトで確認してください

### 価格フィードが stale（古い）で UI の Total Collateral が $0.00 になる（従来のMock方式）

**原因**: `CollateralAdapter.getSPrice()` は更新時刻が1時間以上前だと `"Price data is stale"` で revert します。

**対処法1: Chainlinkへ移行（推奨）**
上記のChainlink設定手順に従ってChainlink Aggregatorに移行してください。

**対処法2: Mockフィードの継続使用**
再デプロイは不要。既存の `CollateralAdapter` に対してモックの価格フィードを新規デプロイし、`setPriceFeed` で差し替えれば解消します。

1) 事前準備（.env）
```bash
PRIVATE_KEY=0x...                  # CollateralAdapter の owner の鍵
RPC_URL=https://rpc.testnet.soniclabs.com
COLLATERAL_ADAPTER_ADDRESS=0x...   # DeployAndSave 実行時に .env へ保存済み
```

2) 価格フィードの差し替え（再デプロイ不要）
```bash
forge script script/UpdatePriceFeed.s.sol:UpdatePriceFeedScript \
  --rpc-url $RPC_URL \
  --broadcast -vvvv
```

3) 価格の更新（stale を避けるために定期的に実行）
- 価格を更新（例: $2100、Chainlink 互換で 8 桁）
```bash
cast send <NEW_FEED_ADDRESS> 'setPrice(int256)' 2100e8 \
  --private-key $PRIVATE_KEY --rpc-url $RPC_URL
```

補足
- `setPriceFeed` は `onlyOwner`。`CollateralAdapter` のオーナー鍵で実行してください。
- フロント側はアダプターのアドレスが変わらないため、差し替え後すぐに `Total Collateral` が正しく表示されます。