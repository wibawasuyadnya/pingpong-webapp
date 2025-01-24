"use server";
import { User } from "@/types/type";
import { decrypt } from "@/utils/sessionEncryption";

interface GetHeaderProps {
  user?: User | string | null;
  data?: Record<string, unknown> | string;
}

export default async function getHeader({ user, data }: GetHeaderProps) {
  let user_token = "";
  let decrypt_data: User | null = null;

  if (typeof user === "string") {
    try {
      decrypt_data = JSON.parse(await decrypt(user)) as User;
      user_token = decrypt_data?.access_token || "";
    } catch (error) {
      console.error("Failed to decrypt user:", error);
    }
  } else if (user) {
    user_token = user.access_token || "";
  }

  const headers: { [key: string]: string } = {
    Accept: "application/json",
  };

  if (user_token) {
    headers["Authorization"] = `Bearer ${user_token}`;
  }

  return headers;
}
