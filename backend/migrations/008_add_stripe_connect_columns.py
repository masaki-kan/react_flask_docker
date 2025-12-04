"""
マイグレーション 008: Stripe Connect用カラム追加
usersテーブルにStripe Connected Account関連のカラムを追加
"""

def upgrade(conn):
    """マイグレーション実行"""
    cursor = conn.cursor()

    try:
        # usersテーブルに Stripe関連カラムを追加
        cursor.execute("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255) DEFAULT NULL
              COMMENT 'Stripe Connected Account ID',
            ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT FALSE
              COMMENT 'Stripeオンボーディング完了フラグ',
            ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE
              COMMENT 'Stripe決済受付可能フラグ',
            ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE
              COMMENT 'Stripe出金可能フラグ',
            ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT FALSE
              COMMENT 'Stripe詳細情報提出済みフラグ'
        """)

        # tradesテーブルにStripe Transfer ID追加
        cursor.execute("""
            ALTER TABLE trades
            ADD COLUMN IF NOT EXISTS stripe_transfer_id VARCHAR(255) DEFAULT NULL
              COMMENT 'Stripe Transfer ID（販売者への送金）'
        """)

        # archived_tradesテーブルにも追加
        cursor.execute("""
            ALTER TABLE archived_trades
            ADD COLUMN IF NOT EXISTS stripe_transfer_id VARCHAR(255) DEFAULT NULL
              COMMENT 'Stripe Transfer ID（販売者への送金）'
        """)

        conn.commit()
        print("✓ マイグレーション 008 成功: Stripe Connect用カラムを追加しました")

    except Exception as e:
        conn.rollback()
        print(f"✗ マイグレーション 008 失敗: {str(e)}")
        raise


def downgrade(conn):
    """ロールバック処理"""
    cursor = conn.cursor()

    try:
        # usersテーブルからStripe関連カラムを削除
        cursor.execute("""
            ALTER TABLE users
            DROP COLUMN IF EXISTS stripe_account_id,
            DROP COLUMN IF EXISTS stripe_onboarding_completed,
            DROP COLUMN IF EXISTS stripe_charges_enabled,
            DROP COLUMN IF EXISTS stripe_payouts_enabled,
            DROP COLUMN IF EXISTS stripe_details_submitted
        """)

        # tradesテーブルから削除
        cursor.execute("""
            ALTER TABLE trades
            DROP COLUMN IF EXISTS stripe_transfer_id
        """)

        # archived_tradesテーブルから削除
        cursor.execute("""
            ALTER TABLE archived_trades
            DROP COLUMN IF EXISTS stripe_transfer_id
        """)

        conn.commit()
        print("✓ ロールバック 008 成功: Stripe Connect用カラムを削除しました")

    except Exception as e:
        conn.rollback()
        print(f"✗ ロールバック 008 失敗: {str(e)}")
        raise
