/**
 * トースト管理システム
 * 重複するエラートーストを防ぎ、ユーザーエクスペリエンスを向上させる
 */

export interface ToastMessage {
  id: string;
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  timestamp: number;
  duration?: number;
}

class ToastManager {
  private activeToasts: Map<string, ToastMessage> = new Map();
  private maxToasts = 3; // 同時に表示する最大トースト数
  private defaultDuration = 5000; // 5秒
  private callbacks: Set<(toasts: ToastMessage[]) => void> = new Set();

  // エラーメッセージの重複を防ぐためのハッシュ生成
  private generateMessageHash(message: string, type: string): string {
    return `${type}_${message.replace(/\s+/g, '_').toLowerCase()}`;
  }

  // システムエラー（5xx, ネットワークエラー）の場合は1つのトーストのみ表示
  private isSystemError(statusCode?: number): boolean {
    return !statusCode || statusCode >= 500 || statusCode === 408;
  }

  // トーストを追加
  addToast(message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error', statusCode?: number, duration?: number): string {
    const messageHash = this.generateMessageHash(message, type);
    
    // システムエラーの場合、既存のシステムエラートーストをクリア
    if (type === 'error' && this.isSystemError(statusCode)) {
      this.clearSystemErrorToasts();
    }

    // 同じメッセージが既に表示されている場合はスキップ
    if (this.activeToasts.has(messageHash)) {
      return messageHash;
    }

    // 最大数を超える場合は古いものを削除
    if (this.activeToasts.size >= this.maxToasts) {
      this.removeOldestToast();
    }

    const toast: ToastMessage = {
      id: messageHash,
      message,
      type,
      timestamp: Date.now(),
      duration: duration || this.defaultDuration,
    };

    this.activeToasts.set(messageHash, toast);
    this.notifySubscribers();

    // 自動削除タイマー
    setTimeout(() => {
      this.removeToast(messageHash);
    }, toast.duration);

    return messageHash;
  }

  // 特定のトーストを削除
  removeToast(id: string): void {
    if (this.activeToasts.delete(id)) {
      this.notifySubscribers();
    }
  }

  // システムエラートーストをクリア
  private clearSystemErrorToasts(): void {
    const systemErrors = Array.from(this.activeToasts.values()).filter(
      toast => toast.type === 'error' && toast.message.includes('サーバーエラー') || 
                toast.message.includes('接続エラー') || 
                toast.message.includes('システムエラー')
    );

    systemErrors.forEach(toast => {
      this.activeToasts.delete(toast.id);
    });
  }

  // 最も古いトーストを削除
  private removeOldestToast(): void {
    let oldestToast: ToastMessage | null = null;
    
    for (const toast of this.activeToasts.values()) {
      if (!oldestToast || toast.timestamp < oldestToast.timestamp) {
        oldestToast = toast;
      }
    }

    if (oldestToast) {
      this.activeToasts.delete(oldestToast.id);
    }
  }

  // 全てのトーストをクリア
  clearAll(): void {
    this.activeToasts.clear();
    this.notifySubscribers();
  }

  // アクティブなトーストを取得
  getActiveToasts(): ToastMessage[] {
    return Array.from(this.activeToasts.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  // 購読者に通知
  private notifySubscribers(): void {
    const toasts = this.getActiveToasts();
    this.callbacks.forEach(callback => callback(toasts));
  }

  // トースト変更の購読
  subscribe(callback: (toasts: ToastMessage[]) => void): () => void {
    this.callbacks.add(callback);
    
    // 購読解除関数を返す
    return () => {
      this.callbacks.delete(callback);
    };
  }
}

// シングルトンインスタンス
export const toastManager = new ToastManager();

// 便利な関数をエクスポート
export const showErrorToast = (message: string, statusCode?: number) => {
  return toastManager.addToast(message, 'error', statusCode);
};

export const showSuccessToast = (message: string) => {
  return toastManager.addToast(message, 'success');
};

export const showWarningToast = (message: string) => {
  return toastManager.addToast(message, 'warning');
};

export const showInfoToast = (message: string) => {
  return toastManager.addToast(message, 'info');
};