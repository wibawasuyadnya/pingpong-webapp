"use client";
import React, { useEffect, useState } from "react";
import { useConnectionStatus } from "@/hook/useConnectionStatus";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function SnackBarConnectionStatus() {
    const isOnline = useConnectionStatus();
    const [wasOffline, setWasOffline] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        show: boolean;
        message: string;
        color: string;
    }>({
        show: false,
        message: "",
        color: "",
    });

    useEffect(() => {
        if (!isOnline) {
            setWasOffline(true);
            setSnackbar({
                show: true,
                message: "No network available, check your internet.",
                color: "#BF0E45", 
            });
        } else {
            if (wasOffline) {
                setSnackbar({
                    show: true,
                    message: "You're back online!",
                    color: "#089347", 
                });
                setWasOffline(false); 
            }
        }

        const timer = setTimeout(() => {
            setSnackbar((prev) => ({ ...prev, show: false }));
        }, 3000);

        return () => clearTimeout(timer);
    }, [isOnline, wasOffline]);

    return (
        <AnimatePresence>
            {snackbar.show && (
                <motion.div
                    className="fixed bottom-10 right-5 text-white px-4 py-3 rounded-full shadow-lg z-50"
                    style={{ backgroundColor: snackbar.color }}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-2">
                        <span className="mr-2 text-sm">{snackbar.message}</span>
                        <button
                            onClick={() => setSnackbar((prev) => ({ ...prev, show: false }))}
                            className="ml-auto"
                        >
                            <X />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
