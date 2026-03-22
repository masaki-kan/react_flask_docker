export const genres = [
  { brandKey: 0, brandName: "90's" },
  { brandKey: 1, brandName: "80's" },
  { brandKey: 2, brandName: "70's" },
  { brandKey: 3, brandName: "60's" },
  { brandKey: 4, brandName: "50's" },
  { brandKey: 5, brandName: "MILITARY ミリタリー" },
  { brandKey: 6, brandName: "WORK ワーク" },
  { brandKey: 7, brandName: "OUTDOOR アウトドア" },
  { brandKey: 8, brandName: "SKATE スケート" },
  { brandKey: 9, brandName: "DENIM デニム" },
  { brandKey: 10, brandName: "LEATHER レザー" },
  { brandKey: 11, brandName: "GOOD REGULAR グッドレギュラー" },
  { brandKey: 12, brandName: "JUNK ジャンク" },
  { brandKey: 13, brandName: "BAND T-SHIRTS バンT" },
];

// プラン情報
export const plans = [
  {
    id: "0",
    name: "月額プラン",
    price: "¥990",
    period: "/月",
    description: "毎月のお支払い",
    badge: "初月無料！",
    color: "blue",
    recommended: true, // 月額プランを推奨に変更
    note: "※月額料金には、販売アカウント維持費・銀行振込手数料・決済システム利用料が含まれております。",
    features: [
      "出品・購入・取引が可能",
      "プロフィールカスタマイズ",
      "優先サポート対応",
    ],
  },
  {
    id: "1",
    name: "年額プラン",
    price: "¥9,900",
    period: "/年",
    description: "年間一括払い",
    badge: "お得！",
    save: "¥1,980お得!",
    color: "orange",
    features: [
      "出品・購入・取引が可能",
      "プロフィールカスタマイズ",
      "優先サポート対応",
    ],
  },
];

export const tradeStatusFlags = [
  { value: 0, text: "" },
  { value: 1, text: "取引中" },
  { value: 2, text: "取引終了" },
];
