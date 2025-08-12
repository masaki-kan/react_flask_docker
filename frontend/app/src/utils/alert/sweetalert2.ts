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
