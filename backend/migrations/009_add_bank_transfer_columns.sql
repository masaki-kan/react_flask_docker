-- ================================================================================
-- 銀行振込決済用のカラムを追加するマイグレーション
-- 作成日: 2026-01-04
-- ================================================================================

-- trades テーブルに銀行振込用のカラムを追加

-- 支払い方法カラムを追加
ALTER TABLE trades
ADD COLUMN IF NOT EXISTS payment_method ENUM('card', 'bank_transfer') DEFAULT 'card' AFTER payment_intent_id;

-- ステータスに awaiting_payment を追加
ALTER TABLE trades
MODIFY COLUMN status ENUM(
    'pending',
    'purchased',
    'shipped',
    'completed',
    'cancelled',
    'price_proposed',    -- 金額が提案された
    'price_agreed',      -- 金額に両者が合意
    'awaiting_payment',  -- 入金待ち（銀行振込）
    'paid',              -- 決済完了
    'buyer_received'     -- Buyerが受け取り確認（購入のみ）
) DEFAULT 'pending';

-- コメント
ALTER TABLE trades
MODIFY COLUMN payment_method ENUM('card', 'bank_transfer') DEFAULT 'card' COMMENT '支払い方法: card=カード決済, bank_transfer=銀行振込';
