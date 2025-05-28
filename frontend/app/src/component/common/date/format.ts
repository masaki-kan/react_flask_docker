export const viewDate = (value: Date): string => {
  const date = new Date(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月は0始まりなので+1
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
};
