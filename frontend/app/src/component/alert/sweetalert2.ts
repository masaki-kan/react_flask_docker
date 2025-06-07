import Swal from "sweetalert2";

export const errorSweetalert2 = (errorTitle: string) => {
  Swal.fire({
    title: errorTitle,
    text: "エラーが発生ました。",
    icon: "error",
  });
};
