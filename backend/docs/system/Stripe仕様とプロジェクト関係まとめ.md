# Stripe仕様とプロジェクトの関係まとめ

## 1. 全体構成

```
┌─────────────┐    決済     ┌──────────────────────┐   Transfer   ┌──────────────────┐
│   購入者     │ ─────────→ │  親プラットフォーム    │ ──────────→ │  販売者           │
│  (Buyer)    │  カード/    │ (僕らのヴィンテージ)  │  取引完了時   │ (Connect Express) │
│             │  銀行振込   │  Stripe支払い残高     │             │                  │
└─────────────┘            └──────────────────────┘             └──────────────────┘
                                    │                                    │
                                    │ 手動入金                            │ 手動出金
                                    ↓                                    ↓
                           ┌────────────────┐                   ┌────────────────┐
                           │ 親の銀行口座    │                   │ 販売者の銀行口座 │
                           │ 三菱UFJ 東大阪  │                   │ (各自登録)      │
                           └────────────────┘                   └────────────────┘
```

## 2. 決済方式: Separate Charges and Transfers

- **2026年2月19日以降**に採用（それ以前はDestination Charge方式）
- 購入者の支払い → まず**親プラットフォームのStripe残高**にプールされる
- 取引完了時に `Transfer.create()` で販売者のConnectアカウントに送金

### なぜこの方式か
- エスクロー（預託）として機能：取引完了まで資金を保持
- 返金が柔軟にできる
- 手数料計算を自由にコントロールできる

## 3. 手数料体系

| 支払い方法 | 手数料率 | 例（¥5,000の商品） |
|-----------|---------|------------------|
| カード     | 3.6%    | 手数料 ¥180 → 販売者に ¥4,820 送金 |
| 銀行振込   | 1.5%    | 手数料 ¥75 → 販売者に ¥4,925 送金 |

```
送金額 = 購入金額 - floor(購入金額 × 手数料率)
```

- 手数料は**販売者が負担**（購入金額から差し引き）
- 手数料分が親プラットフォームの利益として残高に残る

## 4. 取引ステータスと決済の流れ

```
pending（申請中）
  ↓ 販売者が金額提案
price_proposed（金額提案中）
  ↓ 両者が合意
price_agreed（金額合意済み）
  ↓ 購入者が決済
paid（決済済み）              ← ここでStripeに入金される
  ↓ 販売者が発送
shipped（発送済み）
  ↓ 購入者が受取確認
buyer_received（受取確認済み）
  ↓ 販売者が取引完了
completed（取引完了）         ← ここでTransfer実行（販売者に送金）
  ↓ アーカイブ → 削除
archived_trades に保存
```

### 各ステータスでのStripe操作

| ステータス変更 | Stripe操作 | 備考 |
|-------------|-----------|------|
| → paid | `PaymentIntent.create()` | 購入者から集金 |
| → completed | `Transfer.create()` | 販売者へ送金 |
| 返金時 | `Refund.create()` | paid〜buyer_received間のみ可能 |

## 5. 親プラットフォームの残高管理

### 入金スケジュール: 手動入金
- 購入者からの支払いはStripe残高にプールされる
- 親が手動で銀行口座に入金を実行する（自動入金は無効）
- **理由**: 自動入金だと残高がなくなり、Transfer（販売者への送金）が失敗するため

### 残高の流れ
```
[購入者が支払い] → Stripe残高が増える（+購入金額）
[取引完了]      → Stripe残高が減る（-送金額）
[残る利益]      → 手数料分（購入金額 × 手数料率）
[手動入金]      → 親が利益分を銀行口座に引き出す
```

### トップアップ（残高追加）
- 親の登録銀行口座（三菱UFJ 東大阪支店）からのみ可能
- 他の口座からの追加は不可
- 反映まで1〜3営業日
- 残高がマイナスの場合や、銀行振込決済のTransferに必要

## 6. 販売者のConnectアカウント

### アカウント種別: Express
- Stripeが本人確認・銀行口座管理を担当
- 販売者はStripeのオンボーディングページで登録

### 作成時の設定
```python
stripe.Account.create(
    type='express',
    country='JP',
    capabilities={'card_payments': {'requested': True}, 'transfers': {'requested': True}},
    business_type='individual',
    settings={'payouts': {'schedule': {'interval': 'manual'}}}  # 手動出金
)
```

### 販売者の出金（Payout）
- 販売者が手動でアプリから出金申請
- **出金手数料: ¥250**（固定）
- 最低出金額: ¥251（手数料¥250 + 最低¥1）
- Connect残高から販売者の銀行口座へ振込

### DBカラム（usersテーブル）
| カラム | 説明 |
|-------|------|
| `stripe_account_id` | ConnectアカウントID（例: `acct_xxx`） |
| `stripe_charges_enabled` | 決済受付可能か |
| `stripe_payouts_enabled` | 出金可能か |

## 7. Transfer（販売者への送金）の仕組み

### カード決済の場合
```python
# 元のChargeを紐付けて送金（残高不足でも可能）
transfer = stripe.Transfer.create(
    amount=送金額,
    currency='jpy',
    destination=販売者のstripe_account_id,
    source_transaction=charge_id  # 元のChargeに紐付け
)
```
- `source_transaction` を指定 → 元のChargeから直接送金
- **親の残高がなくても実行可能**

### 銀行振込決済の場合
```python
# source_transactionなし → 親の残高から送金
transfer = stripe.Transfer.create(
    amount=送金額,
    currency='jpy',
    destination=販売者のstripe_account_id
)
```
- `source_transaction` なし → **親のStripe残高から送金**
- **残高が不足していると失敗する**

### DBカラム（tradesテーブル）
| カラム | 説明 |
|-------|------|
| `stripe_transfer_id` | TransferのID（例: `tr_xxx`）。完了時に記録 |
| `payment_intent_id` | 決済のPaymentIntentID |
| `payment_method` | `card` or `bank_transfer` |

## 8. 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `backend/api/purchase_flow.py` | 購入フロー全体（決済・Transfer・返金） |
| `backend/api/payment.py` | サブスク決済・販売者残高照会 |
| `backend/api/stripe_connect.py` | Connectアカウント作成・オンボーディング・出金 |
| `backend/api/trades.py` | 取引管理（ステータス更新等） |
| `backend/tradeArchiver.py` | 取引完了後のアーカイブ処理 |
| `backend/recover_missing_transfers.py` | 未送金取引のリカバリスクリプト |
| `backend/database.py` | DBスキーマ定義 |

## 9. 過去の問題と対応

### 2026年2月19日: 決済方式変更
- Destination Charge → Separate Charges and Transfers に変更
- `Transfer.create()` を手動で呼ぶ必要が発生

### 2026年3月〜: Transfer失敗（サイレント）
- **原因1**: `payment_intent.charges`（deprecated）→ `latest_charge` に修正済み
- **原因2**: Transferエラーが握りつぶされていた → 500エラーを返すように修正済み
- **原因3**: APIキーのアクセス制限 → 解除済み
- **原因4**: 自動入金で残高が枯渇 → 手動入金に切替済み

### リカバリスクリプト
```bash
# 対象確認（ドライラン）
docker exec -it flask_app python recover_missing_transfers.py --dry-run

# 実行
docker exec -it flask_app python recover_missing_transfers.py --execute --seller-id 5
```

## 10. 運用上の注意点

1. **残高の監視**: 銀行振込決済がある場合、親の残高が十分か確認する
2. **手動入金のタイミング**: 利益（手数料分）が貯まったら手動で銀行に引き出す
3. **販売者の出金**: 販売者がアプリから出金申請 → ¥250手数料を引いて振込
4. **返金**: `paid`〜`buyer_received`の間のみ可能。`completed`後はTransfer済みのため不可
5. **テスト環境**: `STRIPE_MODE=test` ではダミーIDが生成され、実際の決済は行われない
