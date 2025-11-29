-- ================================================================================
-- 購入フロー用のカラムを追加するマイグレーション
-- 作成日: 2025-11-19
-- ================================================================================

-- trades テーブルに購入フロー用のカラムを追加

ALTER TABLE trades
-- 取引の種類（交換 or 購入）
ADD COLUMN trade_type ENUM('exchange', 'purchase') DEFAULT 'exchange' AFTER status,

-- 購入金額
ADD COLUMN purchase_price DECIMAL(10, 2) DEFAULT NULL AFTER trade_type,

-- 金額を提案したユーザーID
ADD COLUMN price_proposed_by INT DEFAULT NULL AFTER purchase_price,

-- Sellerが金額に合意したか
ADD COLUMN is_price_agreed_seller BOOLEAN DEFAULT FALSE AFTER price_proposed_by,

-- Buyerが金額に合意したか
ADD COLUMN is_price_agreed_buyer BOOLEAN DEFAULT FALSE AFTER is_price_agreed_seller,

-- Stripe PaymentIntent ID
ADD COLUMN payment_intent_id VARCHAR(255) DEFAULT NULL AFTER is_price_agreed_buyer,

-- 決済完了日時
ADD COLUMN paid_at TIMESTAMP NULL AFTER payment_intent_id,

-- Buyer受取確認日時（購入の場合のみ）
ADD COLUMN buyer_received_at TIMESTAMP NULL AFTER paid_at;

-- ステータスに新しい値を追加
ALTER TABLE trades
MODIFY COLUMN status ENUM(
    'pending',
    'purchased',
    'shipped',
    'completed',
    'cancelled',
    'price_proposed',    -- 金額が提案された
    'price_agreed',      -- 金額に両者が合意
    'paid',              -- 決済完了
    'buyer_received'     -- Buyerが受け取り確認（購入のみ）
) DEFAULT 'pending';

-- インデックスを追加（パフォーマンス向上）
CREATE INDEX idx_trade_type ON trades(trade_type);
CREATE INDEX idx_payment_intent ON trades(payment_intent_id);

-- コメント
ALTER TABLE trades
MODIFY COLUMN trade_type ENUM('exchange', 'purchase') DEFAULT 'exchange' COMMENT '取引の種類: exchange=交換, purchase=購入',
MODIFY COLUMN purchase_price DECIMAL(10, 2) DEFAULT NULL COMMENT '購入金額（円）',
MODIFY COLUMN price_proposed_by INT DEFAULT NULL COMMENT '金額を提案したユーザーID',
MODIFY COLUMN is_price_agreed_seller BOOLEAN DEFAULT FALSE COMMENT 'Sellerが金額に合意したか',
MODIFY COLUMN is_price_agreed_buyer BOOLEAN DEFAULT FALSE COMMENT 'Buyerが金額に合意したか',
MODIFY COLUMN payment_intent_id VARCHAR(255) DEFAULT NULL COMMENT 'Stripe PaymentIntent ID',
MODIFY COLUMN paid_at TIMESTAMP NULL COMMENT '決済完了日時',
MODIFY COLUMN buyer_received_at TIMESTAMP NULL COMMENT 'Buyer受取確認日時';
