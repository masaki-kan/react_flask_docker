export const renderSrc = (img: string | File): string => {
  let src = "";

  if (img instanceof File) {
    // 新しくアップロードされたファイル
    src = URL.createObjectURL(img);
  } else if (typeof img === "string") {
    // 既存の画像URL
    if (img.startsWith("/uploads/")) {
      // ローカルパスの場合、APIのベースURLを追加
      src = `${import.meta.env.VITE_API_URL}/api${img}`;
    } else if (img.startsWith("https://") || img.startsWith("data:")) {
      // S3 URLまたはbase64
      src = img;
    } else {
      src = img;
    }
  }

  return src;
};
