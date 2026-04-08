#!/usr/bin/env python3
"""
未送金の過去取引（archived_trades の stripe_transfer_id IS NULL）に対して
Stripe Transferを補填実行するスクリプト

使い方:
  cd backend
  # ドライラン（送金実行せず対象だけ表示）
  python recover_missing_transfers.py --dry-run

  # 全件補填
  python recover_missing_transfers.py --execute

  # 特定の販売者だけ
  python recover_missing_transfers.py --execute --seller-id 4

  # 特定の archive_trade_id だけ
  python recover_missing_transfers.py --execute --archive-id 78

注意:
  - 本番環境のStripeに対して実行します
  - 1月〜2/15のDestination Charge方式で送金済みの取引はスキップされません。
    対象期間は --since オプションで絞ること（デフォルト: 2026-02-19 以降）
"""
import os
import sys
import math
import argparse
from datetime import datetime
from dotenv import load_dotenv
import stripe

# .env を読み込む
load_dotenv()

# DB接続
from utils.db_utils import init_db_pool, get_db_connection

STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_MODE = os.environ.get('STRIPE_MODE', 'live')
stripe.api_key = STRIPE_SECRET_KEY


def fetch_target_trades(since_date, seller_id=None, archive_id=None):
    """補填対象のarchived_tradesを取得"""
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)

        sql = """
            SELECT
                at.archive_trade_id,
                at.original_trade_id,
                at.seller_id,
                at.buyer_id,
                at.purchase_price,
                at.payment_intent_id,
                at.payment_method,
                at.stripe_transfer_id,
                at.trade_completed_at,
                at.seller_name,
                u.stripe_account_id,
                u.stripe_payouts_enabled
            FROM archived_trades at
            JOIN users u ON at.seller_id = u.user_id
            WHERE at.trade_type = 'purchase'
              AND at.final_status = 'completed'
              AND at.stripe_transfer_id IS NULL
              AND at.payment_intent_id IS NOT NULL
              AND at.trade_completed_at >= %s
        """
        params = [since_date]

        if seller_id is not None:
            sql += " AND at.seller_id = %s"
            params.append(seller_id)

        if archive_id is not None:
            sql += " AND at.archive_trade_id = %s"
            params.append(archive_id)

        sql += " ORDER BY at.trade_completed_at"

        cursor.execute(sql, tuple(params))
        return cursor.fetchall()


def calc_transfer_amount(purchase_price, payment_method):
    """手数料差し引き後の送金額を計算"""
    fee_rate = 0.015 if payment_method == 'bank_transfer' else 0.036
    stripe_fee = math.floor(float(purchase_price) * fee_rate)
    transfer_amount = int(float(purchase_price) - stripe_fee)
    return transfer_amount, stripe_fee


def already_transferred(payment_intent_id, destination_account):
    """
    同じPaymentIntentから既にTransferが作成されていないかチェック
    （同じcharge_idに対するsource_transactionの重複を防ぐ）
    """
    try:
        pi = stripe.PaymentIntent.retrieve(payment_intent_id)
        charge_id = getattr(pi, 'latest_charge', None)
        if not charge_id:
            charges = getattr(pi, 'charges', None)
            if charges and getattr(charges, 'data', None):
                charge_id = charges.data[0].id

        if not charge_id:
            return False, None

        # この charge から作られた transfers を検索
        transfers = stripe.Transfer.list(limit=10, transfer_group=None)
        for t in transfers.auto_paging_iter():
            if t.source_transaction == charge_id and t.destination == destination_account:
                return True, t.id
            # 多すぎる場合は止める
        return False, charge_id
    except Exception as e:
        print(f"  [WARN] 既存Transfer確認失敗: {e}")
        return False, None


def execute_transfer(trade):
    """1件の取引に対してTransferを実行"""
    payment_method = trade.get('payment_method') or 'card'
    purchase_price = float(trade['purchase_price'])
    transfer_amount, stripe_fee = calc_transfer_amount(purchase_price, payment_method)
    destination = trade['stripe_account_id']

    is_bank_transfer = payment_method == 'bank_transfer'

    metadata = {
        'recovered': 'true',
        'archive_trade_id': str(trade['archive_trade_id']),
        'original_trade_id': str(trade['original_trade_id']),
        'seller_id': str(trade['seller_id']),
        'purchase_price': str(int(purchase_price)),
        'stripe_fee': str(stripe_fee),
        'transfer_amount': str(transfer_amount),
        'payment_method': payment_method,
    }

    if is_bank_transfer:
        # 銀行振込: source_transactionなし
        transfer = stripe.Transfer.create(
            amount=transfer_amount,
            currency='jpy',
            destination=destination,
            metadata=metadata,
        )
    else:
        # カード: source_transaction で元のChargeを指定
        pi = stripe.PaymentIntent.retrieve(trade['payment_intent_id'])
        charge_id = getattr(pi, 'latest_charge', None)
        if not charge_id:
            charges = getattr(pi, 'charges', None)
            if charges and getattr(charges, 'data', None):
                charge_id = charges.data[0].id
        if not charge_id:
            raise Exception(f"PaymentIntent {trade['payment_intent_id']} のChargeが見つかりません")

        transfer = stripe.Transfer.create(
            amount=transfer_amount,
            currency='jpy',
            destination=destination,
            source_transaction=charge_id,
            metadata=metadata,
        )

    return transfer.id, transfer_amount


def update_archive_with_transfer_id(archive_trade_id, transfer_id):
    """archived_trades.stripe_transfer_id を更新"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE archived_trades
            SET stripe_transfer_id = %s
            WHERE archive_trade_id = %s
        """, (transfer_id, archive_trade_id))
        conn.commit()


def main():
    parser = argparse.ArgumentParser(description='未送金の過去取引にStripe Transferを補填')
    parser.add_argument('--dry-run', action='store_true', help='対象を表示するだけで実行しない')
    parser.add_argument('--execute', action='store_true', help='実際にTransferを実行する')
    parser.add_argument('--seller-id', type=int, default=None, help='特定の販売者のみ')
    parser.add_argument('--archive-id', type=int, default=None, help='特定のarchive_trade_idのみ')
    parser.add_argument('--since', type=str, default='2026-02-19', help='対象開始日 (YYYY-MM-DD)')
    args = parser.parse_args()

    if not args.dry_run and not args.execute:
        print("ERROR: --dry-run か --execute のいずれかを指定してください")
        sys.exit(1)

    if STRIPE_MODE != 'live':
        print(f"⚠️  STRIPE_MODE={STRIPE_MODE} です。本番環境で実行する場合は STRIPE_MODE=live にしてください")
        if args.execute:
            print("ERROR: --execute は STRIPE_MODE=live でしか実行できません")
            sys.exit(1)

    # DB pool初期化
    init_db_pool()

    print(f"=== 未送金取引の補填スクリプト ===")
    print(f"モード: {'DRY RUN' if args.dry_run else 'EXECUTE'}")
    print(f"対象開始日: {args.since}")
    if args.seller_id:
        print(f"販売者ID: {args.seller_id}")
    if args.archive_id:
        print(f"アーカイブID: {args.archive_id}")
    print()

    targets = fetch_target_trades(args.since, args.seller_id, args.archive_id)

    if not targets:
        print("対象取引はありません。")
        return

    print(f"対象取引: {len(targets)} 件\n")

    total_amount = 0
    success_count = 0
    fail_count = 0
    skip_count = 0

    for t in targets:
        purchase_price = float(t['purchase_price'])
        payment_method = t.get('payment_method') or 'card'
        transfer_amount, stripe_fee = calc_transfer_amount(purchase_price, payment_method)

        print(f"--- archive_trade_id={t['archive_trade_id']} (trade_id={t['original_trade_id']}) ---")
        print(f"  販売者: {t['seller_name']} (id={t['seller_id']})")
        print(f"  完了日時: {t['trade_completed_at']}")
        print(f"  購入金額: ¥{int(purchase_price)} / 手数料: ¥{stripe_fee} / 送金額: ¥{transfer_amount}")
        print(f"  payment_method: {payment_method}")
        print(f"  payment_intent_id: {t['payment_intent_id']}")
        print(f"  stripe_account_id: {t['stripe_account_id']}")
        print(f"  payouts_enabled: {t['stripe_payouts_enabled']}")

        # 事前チェック
        if not t['stripe_account_id']:
            print(f"  ⚠️  SKIP: stripe_account_id がありません")
            skip_count += 1
            print()
            continue

        if not t['stripe_payouts_enabled']:
            print(f"  ⚠️  SKIP: stripe_payouts_enabled が False")
            skip_count += 1
            print()
            continue

        if args.dry_run:
            print(f"  [DRY RUN] Transfer実行をスキップ")
            total_amount += transfer_amount
            print()
            continue

        # 既存Transfer重複チェック
        already, charge_or_id = already_transferred(t['payment_intent_id'], t['stripe_account_id'])
        if already:
            print(f"  ⚠️  SKIP: 既にTransfer済み ({charge_or_id})")
            update_archive_with_transfer_id(t['archive_trade_id'], charge_or_id)
            print(f"  → archived_trades を更新")
            skip_count += 1
            print()
            continue

        # 実行
        try:
            transfer_id, amount = execute_transfer(t)
            update_archive_with_transfer_id(t['archive_trade_id'], transfer_id)
            print(f"  ✅ Transfer成功: {transfer_id} (¥{amount})")
            success_count += 1
            total_amount += amount
        except stripe.error.StripeError as e:
            print(f"  ❌ Stripeエラー: {str(e)}")
            fail_count += 1
        except Exception as e:
            print(f"  ❌ エラー: {str(e)}")
            fail_count += 1

        print()

    print("=" * 50)
    print(f"集計:")
    print(f"  対象: {len(targets)} 件")
    if args.dry_run:
        print(f"  送金予定額合計: ¥{total_amount}")
    else:
        print(f"  成功: {success_count} 件")
        print(f"  失敗: {fail_count} 件")
        print(f"  スキップ: {skip_count} 件")
        print(f"  送金額合計: ¥{total_amount}")


if __name__ == '__main__':
    main()
