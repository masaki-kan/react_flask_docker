import Swal from "sweetalert2";
import { route } from "../../route/routeConst";

export const errorSweetalert2 = (errorTitle: string) => {
  Swal.fire({
    title: "",
    text: errorTitle,
    icon: "error",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = route.profile;
    }
  });
};

// システムエラーでログアウトする場合のアラート
export const systemErrorLogoutAlert = () => {
  Swal.fire({
    title: "システムエラー",
    text: "プロフィール情報の取得に失敗したため、ログアウトします。",
    icon: "error",
    confirmButtonText: "OK",
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
};
