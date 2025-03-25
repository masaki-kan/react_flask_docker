import Swal from "sweetalert2";

export const sweetAlert = (iconKind: boolean, txt: string) => {
  Swal.fire({
    position: "top-end",
    icon: iconKind ? "success" : "warning",
    title: txt,
    showConfirmButton: false,
    timer: 1500,
    width: 300, // 幅を300ピクセルに設定
  });
};
