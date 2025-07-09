import { route } from "../route/routeConst";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";

export const menuLists = [
  {
    text: "Users",
    route: route.users,
  },
  {
    text: "Items",
    route: route.items,
  },
  {
    text: "Favorite",
    route: route.favorite,
  },
  {
    text: "Saved",
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
