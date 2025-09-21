import { useState, useEffect } from 'react';
import { toastManager, ToastMessage, showErrorToast, showSuccessToast, showWarningToast, showInfoToast } from '../utils/toast/toastManager';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // トーストマネージャーの変更を購読
    const unsubscribe = toastManager.subscribe((newToasts) => {
      setToasts(newToasts);
    });

    // 初期状態を設定
    setToasts(toastManager.getActiveToasts());

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    toastManager.removeToast(id);
  };

  const clearAllToasts = () => {
    toastManager.clearAll();
  };

  return {
    toasts,
    removeToast,
    clearAllToasts,
    showError: showErrorToast,
    showSuccess: showSuccessToast,
    showWarning: showWarningToast,
    showInfo: showInfoToast,
  };
};