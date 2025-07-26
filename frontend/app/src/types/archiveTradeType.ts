// types/archiveTypes.ts

// アーカイブ取引データ
export interface archiveTradeType {
  archive_trade_id: number;
  original_trade_id: number;
  item_archive_id: number;
  seller_id: number;
  buyer_id: number;
  seller_exchange_item_archive_id: number | null;
  buyer_exchange_item_archive_id: number | null;
  final_status: string;
  trade_created_at: string;
  trade_completed_at: string;
  seller_name: string;
  seller_email: string;
  buyer_name: string;
  buyer_email: string;
  seller_location: string;
  buyer_location: string;
  seller_profile_image_at_archive: string | null;
  buyer_profile_image_at_archive: string | null;
  archived_at: string;

  // メイン商品情報
  // main_item_title: string;
  // main_item_description: string;
  // main_item_type: itemType[] | itemType;
  // main_item_brand: brandType[] | brandType;
  // main_item_status: string;
  // main_item_images: string[];

  // 売り手交換商品情報
  seller_exchange_title?: string;
  seller_exchange_description?: string;
  seller_exchange_type?: string;
  seller_exchange_brand?: brandType;
  seller_exchange_images?: string[];

  // 買い手交換商品情報
  buyer_exchange_title?: string;
  buyer_exchange_description?: string;
  buyer_exchange_type?: string;
  buyer_exchange_brand?: brandType;
  buyer_exchange_images?: string[];
}

// アーカイブメッセージ
export interface archiveMessage {
  archive_message_id: number;
  archive_trade_id: number;
  sender_id: number;
  sender_name: string;
  message: string;
  sent_at: string;
  sender_profile_image_at_archive: string | undefined;
  archived_at: string;
}

// アーカイブ配送情報
export interface archiveShippingInfo {
  archive_shipping_id: number;
  archive_trade_id: number;
  sender_user_id: number;
  sender_name: string;
  tracking_number: string;
  shipping_company: string;
  created_at: string;
  archived_at: string;
}

// アーカイブ確認情報
export interface archiveConfirmation {
  archive_confirmation_id: number;
  archive_trade_id: number;
  user_id: number;
  user_name: string;
  confirmation_type: string;
  confirmed_at: string;
  archived_at: string;
}

// アーカイブレビュー
export interface archiveReview {
  archive_review_id: number;
  archive_trade_id: number;
  reviewer_id: number;
  reviewer_name: string;
  reviewee_id: number;
  reviewee_name: string;
  rating: number | null;
  reviewer_comment: string | null;
  reviewee_comment: string | null;
  reviewed_at: string | null;
  archived_at: string;
}

// アイテムタイプ
export interface itemType {
  key: number;
  name: string;
}

// ブランドタイプ
export interface brandType {
  key: string;
  name: string;
}

// アーカイブ詳細API レスポンス
export interface archiveDetailResponse {
  result: boolean;
  trade: archiveTradeType;
  messages: archiveMessage[];
  shipping_info: archiveShippingInfo[];
  confirmations: archiveConfirmation[];
  reviews: archiveReview[];
}

// 交換履歴一覧の型（既存のexchangeArchiveModalで使用）
export interface exchangeArchive {
  archive_trade_id: number;
  original_trade_id: number;
  seller_id: number;
  buyer_id: number;
  trade_date: string;
  completed_date: string;
  seller_name: string;
  buyer_name: string;
  seller_image: string;
  buyer_image: string;
  user_role: "seller" | "buyer";
  seller_item_title?: string;
  seller_item_brand?: brandType[] | brandType;
  seller_item_images?: string[];

  buyer_item_title?: string;
  buyer_item_brand?: brandType[] | brandType;
  buyer_item_images?: string[];
}
