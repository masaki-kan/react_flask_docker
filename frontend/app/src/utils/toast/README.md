# トースト管理システム

複数のエラートーストが同時に表示されることを防ぎ、ユーザーエクスペリエンスを向上させるシステムです。

## 特徴

### 1. **重複防止**
- 同じエラーメッセージは重複して表示されません
- システムエラー（5xx、ネットワークエラー）は1つのトーストのみ表示

### 2. **最大表示数制限**
- 同時に表示されるトーストは最大3つまで
- 新しいトーストが追加されると、古いものから自動削除

### 3. **自動削除**
- 5秒後に自動で消える
- 手動でも閉じることが可能

### 4. **システムエラーの統合**
- サーバーエラーやネットワークエラーは統合表示
- 複数のAPIが失敗しても1つのエラートーストのみ

## 使い方

### 基本的な使用

```typescript
import { showErrorToast, showSuccessToast } from '../utils/toast/toastManager';

// エラートーストを表示
showErrorToast("エラーが発生しました", 500); // statusCodeも指定可能

// 成功トーストを表示
showSuccessToast("保存が完了しました");
```

### Reactコンポーネントでの使用

```typescript
import { useToast } from '../hooks/useToast';

const MyComponent = () => {
  const { showError, showSuccess } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess("保存が完了しました");
    } catch (error) {
      showError("保存に失敗しました");
    }
  };

  return <button onClick={handleSave}>保存</button>;
};
```

### API関数での自動エラー表示

```typescript
// 自動でトーストを表示（デフォルト）
return createErrorResponse(error, "ログインに失敗しました");

// トーストを表示しない
return createSilentErrorResponse(error, "ログインに失敗しました");
```

## API

### showErrorToast(message, statusCode?)
- エラートーストを表示
- statusCodeを指定するとシステムエラーの判定に使用

### showSuccessToast(message)
- 成功トーストを表示

### showWarningToast(message)
- 警告トーストを表示

### showInfoToast(message)
- 情報トーストを表示

## システムエラーの判定

以下の場合はシステムエラーとして扱われます：
- HTTP ステータス 500以上
- HTTP ステータス 408（タイムアウト）
- ネットワークエラー（statusCodeが未定義）

システムエラーの場合、既存のシステムエラートーストはクリアされ、新しいトーストが1つだけ表示されます。