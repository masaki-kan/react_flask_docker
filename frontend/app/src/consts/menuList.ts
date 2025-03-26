import { CiCircleList, CiHeart } from "react-icons/ci";
import { TbCreditCardPay } from "react-icons/tb";
import { route } from "../route/routeConst";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";

export const menuLists = [
  {
    text: "Users",
    icon: CiCircleList,
    route: route.users,
  },
  {
    text: "Items",
    icon: TbCreditCardPay,
    route: route.items,
  },
  {
    text: "Saved",
    icon: CiHeart,
    route: route.saved,
  },
];

export const footerMenu = [
  {
    text: "Setting",
    icon: IoSettingsOutline,
    route: "",
  },
  {
    text: "Help & Support",
    icon: IoMdHelpCircleOutline,
    route: "",
  },
];
