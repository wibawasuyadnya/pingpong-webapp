import { IronSessionData } from "iron-session";
import { User } from "@/types/type";

declare module "iron-session" {
  interface IronSessionData {
    user?: User;
    isLoggedIn?: boolean;
    timerStartTime: number;
  }
}
