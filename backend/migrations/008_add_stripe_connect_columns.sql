-- マイグレーション 008: Stripe Connect用カラム追加
-- usersテーブルにStripe Connected Account関連のカラムを追加

-- usersテーブルにStripe関連カラムを追加
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
  COMMENT 'Stripe詳細情報提出済みフラグ';

-- tradesテーブルにStripe Transfer ID追加
ALTER TABLE trades
ADD COLUMN IF NOT EXISTS stripe_transfer_id VARCHAR(255) DEFAULT NULL
  COMMENT 'Stripe Transfer ID（販売者への送金）';

-- archived_tradesテーブルにも追加
ALTER TABLE archived_trades
ADD COLUMN IF NOT EXISTS stripe_transfer_id VARCHAR(255) DEFAULT NULL
  COMMENT 'Stripe Transfer ID（販売者への送金）';
