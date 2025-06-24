import Swal from "sweetalert2";
import { route } from "../../route/routeConst";

export const errorSweetalert2 = (errorTitle: string) => {
  Swal.fire({
    title: errorTitle,
    text: "エラーが発生しました。",
    icon: "error",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = route.home;
    }
  });
};
