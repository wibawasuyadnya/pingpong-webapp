"use client";
import { useEffect, useRef } from "react";
import { SessionData } from "@/types/type";
import { useDecryptedUserHook } from "./useDecryptedUser";

const INACTIVITY_TIMEOUT = 1800000;
const EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "wheel",
  "touchstart",
  "scroll",
];

interface useIdleProps {
  session: SessionData;
}

export const useIdleLogoutHook = ({ session }: useIdleProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const user = useDecryptedUserHook(session.user);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      logoutUser();
    }, INACTIVITY_TIMEOUT);
  };

  const logoutUser = async () => {
    try {
      if (!session.isLoggedIn || user?.access_token?.length === 0) return;
      const response = await fetch("/api/auth/logout", {
        method: "DELETE",
      });
      if (response.ok) {
        window.location.href = "/login";
      } else {
        console.error("Logout failed.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const handleActivity = () => resetTimeout();

    EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    resetTimeout();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, []);

  return null;
};
