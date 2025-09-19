import React, { FC } from 'react';
import { useTokenExpiry } from '../../hooks/useTokenExpiry';

/**
 * トークン期限切れ監視プロバイダー
 * アプリケーション全体でトークンの期限切れを監視
 */
const TokenExpiryProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  // トークン期限切れフックを実行（バックグラウンドで監視）
  useTokenExpiry();

  return <>{children}</>;
};

export default TokenExpiryProvider;