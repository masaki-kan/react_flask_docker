import { route } from "../route/routeConst";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";

export const menuLists = [
  // {
  //   text: "ユーザー",
  //   route: route.users,
  // },
  {
    text: "スレッド",
    route: route.thread,
  },

  {
    text: "アイテム",
    route: route.items,
  },
  {
    text: "お気に入り",
    route: route.favorite,
  },
  {
    text: "交換",
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
