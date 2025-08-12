export const checkPatter = (text: string) => {
  // SNSドメインのパターン
  const snsPatterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com/gi,
    /(?:https?:\/\/)?(?:www\.)?instagram\.com/gi,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com/gi,
    /(?:https?:\/\/)?(?:www\.)?line\.me/gi,
    /(?:https?:\/\/)?(?:www\.)?discord\.gg/gi,
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com/gi,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com/gi,
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com/gi,
    /(?:https?:\/\/)?(?:www\.)?telegram\.org/gi,
    /(?:https?:\/\/)?(?:www\.)?whatsapp\.com/gi,
  ];

  // SNSアカウントIDのパターン
  const accountPatterns = [
    /@[\w\d_]+/g, // @username形式
    /(?:LINE|ライン)[\s]*(?:ID|id|アイディー)?[\s]*[:：]?[\s]*[\w\d_-]+/gi,
    /(?:インスタ|Instagram|IG)[\s]*(?:ID|id|アカウント)?[\s]*[:：]?[\s]*@?[\w\d_.]+/gi,
    /(?:Twitter|ツイッター|X)[\s]*(?:ID|id|アカウント)?[\s]*[:：]?[\s]*@?[\w\d_]+/gi,
    /(?:Discord|ディスコード|ディスコ)[\s]*(?:ID|id)?[\s]*[:：]?[\s]*[\w\d_#]+/gi,
  ];

  // 電話番号のパターン（日本の形式）
  const phonePatterns = [
    /0\d{1,4}-?\d{1,4}-?\d{4}/g, // 固定電話・携帯電話
    /\+81[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{4}/g, // 国際形式
    /０[０-９]{1,4}[ー－―-]?[０-９]{1,4}[ー－―-]?[０-９]{4}/g, // 全角
  ];

  // メールアドレスのパターン
  const emailPattern = /[\w\d._+-]+@[\w\d.-]+\.[\w\d]{2,}/gi;

  // 検出処理
  for (const pattern of snsPatterns) {
    if (pattern.test(text)) {
      return {
        isProhibited: true,
        message: "他のSNSへの誘導URLは投稿できません。",
      };
    }
  }

  for (const pattern of accountPatterns) {
    if (pattern.test(text)) {
      return {
        isProhibited: true,
        message: "SNSアカウントIDの記載は禁止されています。",
      };
    }
  }

  for (const pattern of phonePatterns) {
    if (pattern.test(text)) {
      return {
        isProhibited: true,
        message: "電話番号の記載は禁止されています。",
      };
    }
  }

  if (emailPattern.test(text)) {
    return {
      isProhibited: true,
      message: "メールアドレスの記載は禁止されています。",
    };
  }

  // 追加の禁止ワード
  // const prohibitedWords = [
  //   "直接取引",
  //   "直取引",
  //   "直接",
  //   "ちょくせつ",
  //   "直接やり取り",
  //   "外部で",
  //   "別の場所で",
  //   "連絡先",
  //   "個人情報",
  //   "電話して",
  //   "メールして",
  //   "DM",
  //   "ダイレクトメッセージ",
  // ];

  // for (const word of prohibitedWords) {
  //   if (text.includes(word)) {
  //     return {
  //       isProhibited: true,
  //       message: `「${word}」を含む内容は投稿できません。`,
  //     };
  //   }
  // }

  return { isProhibited: false, message: "" };
};
