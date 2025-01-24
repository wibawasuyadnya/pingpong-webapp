// /lib/getUserSession.ts
"use server";
import { getServerActionSession } from "@/lib/iron-config/session";
import { encrypt } from "@/utils/sessionEncryption";

async function getSessionUser() {
  const session = await getServerActionSession();
  if (session.isLoggedIn && session.user) {
    return {
      isLoggedIn: true,
      user: await encrypt(JSON.stringify(session.user)), 
      timerStartTime: session.timerStartTime,
    };
  }
  return {
    isLoggedIn: false,
    user: null,
    timerStartTime: session.timerStartTime,
  };
}

export { getSessionUser };
