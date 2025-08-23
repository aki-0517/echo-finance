### 価格フィード自動反映（Chainlink）実装プラン

#### 目的
- 価格フィードの差し替えや手動更新なしで、Chainlink Aggregator の最新価格を常に参照する。
- 既存の `CollateralAdapter` を流用し、`latestRoundData()` と `decimals()` を用いて自動反映。

#### 現状の確認
- `CollateralAdapter.getSPrice()` は `IPriceFeed.latestRoundData()` を直接参照し、`updatedAt` の鮮度を `STALENESS_THRESHOLD`（デフォルト1時間）で検証済み。
- 現在はテストネット用にモックフィードをデプロイして `setPriceFeed` で差し替える運用を前提としている。

#### 変更方針（Sonic testnet の Chainlink を常用）
1. 一度だけ `CollateralAdapter.setPriceFeed(PRICE_FEED_ADDRESS)` を呼び、Sonic testnet の Chainlink Aggregator アドレスに固定。
2. デプロイスクリプトは常に `.env` の `PRICE_FEED_ADDRESS` を使用する（モックは使用しない）。
3. 以後は Chainlink がオンチェーンで更新するため、アプリ側は常に最新値を取得（差し替え/手動更新は不要）。

---

### 実装詳細

#### コントラクト側
- 実装変更なし。
  - `CollateralAdapter` は Chainlink 互換の `latestRoundData()` と `decimals()` を呼び出しており、Aggregator アドレスを指定すればそのまま稼働。
  - `STALENESS_THRESHOLD`（秒）により古いデータは拒否される。対象アセットの更新頻度に応じて将来的に可変化する余地あり。

#### スクリプト側
- 既存デプロイの移行用：`SetPriceFeed.s.sol`（新規追加想定）
  - 既存の `CollateralAdapter` に対して `.env` の `PRICE_FEED_ADDRESS`（Chainlink Aggregator）を設定する一度きりのスクリプト。

- 新規デプロイ用：`DeployAndSave.s.sol`
  - `.env` の `PRICE_FEED_ADDRESS` をそのまま `CollateralAdapter` コンストラクタへ注入（モックは使用しない）。
  - アドレス保存処理では `PRICE_FEED_ADDRESS` を .env に書き出す。

---

### 運用フロー

#### 既存デプロイの移行手順（推奨）
1. `.env` を設定
   - `PRIVATE_KEY`（`CollateralAdapter` のオーナー）
   - `RPC_URL`
   - `COLLATERAL_ADAPTER_ADDRESS`
   - `PRICE_FEED_ADDRESS`（Chainlink Aggregator のコントラクトアドレス）
2. スクリプト実行
```
forge script contract/script/SetPriceFeed.s.sol:SetPriceFeedScript \
  --rpc-url $RPC_URL --broadcast -vvvv
```

#### 新規デプロイ（Sonic testnet／本番運用）
1. `.env` を設定
   - `PRIVATE_KEY`
   - `RPC_URL`
   - `PRICE_FEED_ADDRESS`（Chainlink Aggregator）
2. デプロイ実行
```
forge script contract/script/DeployAndSave.s.sol:DeployAndSaveScript \
  --rpc-url $RPC_URL --broadcast -vvvv
```

---

### .env で設定すべきもの（一覧）

#### 契約リポジトリ（contract/.env）
- 必須/一般
  - `PRIVATE_KEY`: スクリプト実行に使用するアカウントの秘密鍵
  - `RPC_URL`: 接続先ノード
  - `ETHERSCAN_API_KEY`: 任意（検証で使用）
- デプロイ結果/既存参照
  - `VAULT_MANAGER_ADDRESS`: デプロイ後に保存
  - `STABLECOIN_ADDRESS`: デプロイ後に保存
  - `COLLATERAL_ADAPTER_ADDRESS`: デプロイ後に保存
  - `S_TOKEN_ADDRESS`: デプロイ後に保存
  - `STS_TOKEN_ADDRESS`: デプロイ後に保存
  - `PRICE_FEED_ADDRESS`: Sonic testnet の Chainlink Aggregator を指定

#### フロントエンド（web/.env）
- コントラクト
  - `VITE_VAULT_MANAGER_ADDRESS`
  - `VITE_STABLECOIN_ADDRESS`
  - `VITE_COLLATERAL_ADAPTER_ADDRESS`
  - `VITE_S_TOKEN_ADDRESS`
  - `VITE_STS_TOKEN_ADDRESS`
- ネットワーク
  - `VITE_SONIC_TESTNET_RPC`
  - `VITE_SONIC_EXPLORER`
- ウォレット
  - `VITE_WALLETCONNECT_PROJECT_ID`

---

### 既知の注意点 / リスク
- 対象ネットワークに Chainlink Aggregator が存在しない場合は本方式は不可。代替として：
  - Mock フィードを継続し、Automation 等で定期 push 更新。
  - あるいは他ネットワーク由来の価格をブリッジする専用アダプタを実装。
- `decimals` は多くが 8 桁。`CollateralAdapter` は 1e18 へ正規化済み。
- `STALENESS_THRESHOLD` により低頻度更新のフィードでリバートする可能性。アセットに合わせて見直し検討。

---

### コマンド例
```
# 既存Adapterへ Chainlink（Sonic testnet）を設定（移行）
export PRIVATE_KEY=0x...
export RPC_URL=...
export COLLATERAL_ADAPTER_ADDRESS=0xYourAdapter
export PRICE_FEED_ADDRESS=0xChainlinkAggregator
forge script contract/script/SetPriceFeed.s.sol:SetPriceFeedScript \
  --rpc-url $RPC_URL --broadcast -vvvv

# デプロイ（実オラクル）
export PRICE_FEED_ADDRESS=0xChainlinkAggregator
forge script contract/script/DeployAndSave.s.sol:DeployAndSaveScript \
  --rpc-url $RPC_URL --broadcast -vvvv
```

---

### 影響範囲
- バックエンド（スクリプトと `.env`）のみの更新。`CollateralAdapter` とフロントエンド実装への影響は無し（アドレス指定のみ）。


