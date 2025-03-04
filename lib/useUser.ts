import { SessionData } from "@/types/type";
import { getSessionUser } from "./getUserSession";
import fetcher from "./fetchJson";

interface UseUserProps {
  redirectTo?: string;
  redirectIfFound?: boolean;
  name?: string;
  email?: string;
  phone_number?: string;
  access_token?: string;
}

export async function useUser({
  redirectTo = "",
  redirectIfFound = false,
  name,
  phone_number,
  email,
  access_token,
}: UseUserProps = {}) {
  const session: SessionData = await getSessionUser();

  const isLoggedIn = session.isLoggedIn && typeof session.user !== "string";
  const user = isLoggedIn ? session.user : null;

  const url = new URL("/api/auth/login", window.location.origin);

  await fetcher(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      phone_number,
      access_token,
    }),
  });

  if (redirectTo) {
    if ((!redirectIfFound && !isLoggedIn) || (redirectIfFound && isLoggedIn)) {
      return {
        redirectTo,
        user,
      };
    }
  }

  return { user };
}
