"use server";
import { deleteServerActionSession } from "@/lib/iron-config/session";

export const handleLogout = async () => {
  try {
    await deleteServerActionSession();

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("unauthorized"));
    }
  } catch (err) {
    console.error("Error during logout:", err);
  }
};
