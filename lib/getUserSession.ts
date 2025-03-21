// /lib/getUserSession.ts
"use server";
import { getServerActionSession } from "@/lib/iron-config/session";
import { encrypt } from "@/utils/sessionEncryption";

async function getSessionUser() {
  const session = await getServerActionSession();
  if (session.isLoggedIn && session.user) {
    return {
      isLoggedIn: true,
      picture: session.picture,
      user: await encrypt(JSON.stringify(session.user)),
    };
  }
  return {
    isLoggedIn: false,
    picture: '',
    user: null,
  };
}

export { getSessionUser };
