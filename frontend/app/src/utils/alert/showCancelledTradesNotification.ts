import Swal from "sweetalert2";

export const cancelNotification = (
  cancelledTrades: { trade_id: string; item_title: string }[]
) => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  if (cancelledTrades.length === 1) {
    Toast.fire({
      icon: "warning",
      title: "取引が自動キャンセルされました",
      html: `<p>「${cancelledTrades[0].item_title}」の取引が<br/>1週間チャットがなかったため<br/>自動的にキャンセルされました。</p>`,
    });
  } else {
    const itemList = cancelledTrades
      .map((trade) => `<li>${trade.item_title}</li>`)
      .join("");

    Toast.fire({
      icon: "warning",
      title: `${cancelledTrades.length}件の取引が自動キャンセルされました`,
      html: `
        <p>以下の取引が1週間チャットがなかったため<br/>自動的にキャンセルされました：</p>
        <ul style="text-align: left; margin: 10px 0;">${itemList}</ul>
      `,
      timer: 7000,
    });
  }
};
