"use client"; 

import { useEffect, useState } from "react";

export function useConnectionStatus(): boolean {
    const [isOnline, setIsOnline] = useState<boolean>(true);

    useEffect(() => {
        // If you want the initial state to respect the actual navigator.onLine value:
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return isOnline;
}
