import Swal from "sweetalert2";
import { route } from "../../../route/routeConst";

export const approvalSeetalert = (title: string) => {
  Swal.fire({
    title: "",
    text: title,
    icon: "success",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = route.saved;
    }
  });
};
