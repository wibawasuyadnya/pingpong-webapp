"use client";

import React, { useEffect, useState } from "react";
import { useConnectionStatus } from "@/hook/useConnectionStatus";

export default function ConnectionSnackbar() {
    const isOnline = useConnectionStatus();
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Each time `isOnline` changes, show the snackbar
        if (!isOnline) {
            setMessage("You are offline");
            setShow(true);
        }
        
        // Hide after 3 seconds
        const timer = setTimeout(() => {
            setShow(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [isOnline]);

    if (!show) return null;

    return (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 
                    bg-gray-800 text-white px-4 py-2 rounded shadow">
            {message}
        </div>
    );
}
