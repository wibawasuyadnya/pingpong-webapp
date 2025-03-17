"use client";

import React, {
    forwardRef,
    useRef,
    useEffect,
    useImperativeHandle
} from "react";
import { useRouter } from "next/navigation";
import fetcher from "@/lib/fetchJson";
import { MaterialDialog, MaterialDialogElement } from "../MaterialWeb-Components/material-dialog";

export interface LogOutModalHandle {
    show: () => void;
    close: () => void;
}

const LogOutModal = forwardRef<LogOutModalHandle>((_, ref) => {
    const router = useRouter();
    const dialogRef = useRef<MaterialDialogElement>(null);

    useEffect(() => {
        const el = dialogRef.current;
        if (!el) return;

        // Wait a short time so the shadow DOM is rendered
        setTimeout(() => {
            const logoutBtn = el.shadowRoot?.querySelector("#logoutBtn") as HTMLElement;
            const noBtn = el.shadowRoot?.querySelector("#noBtn") as HTMLElement;

            if (logoutBtn) {
                logoutBtn.addEventListener("click", async () => {
                    const originalText = logoutBtn.textContent || "Log out";
                    logoutBtn.textContent = "Loading...";
                    logoutBtn.setAttribute("disabled", "true");
                    try {
                        await fetcher("/api/auth/logout", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                        });
                        router.push("/login");
                    } catch (error) {
                        console.error("Logout failed:", error);
                    }
                    logoutBtn.textContent = originalText;
                    logoutBtn.removeAttribute("disabled");
                    el.close();
                });
            }

            if (noBtn) {
                noBtn.addEventListener("click", () => {
                    el.close();
                });
            }
        }, 100);
    }, [router]);

    useImperativeHandle(ref, () => ({
        show: () => {
            dialogRef.current?.show();
        },
        close: () => {
            dialogRef.current?.close();
        }
    }));

    return (
        <MaterialDialog
            ref={dialogRef}
            headline="Oh no you're leaving, you sure you want to Log out?"
            headingfontsize="1.35rem"
            headingalign="center"
        />
    );
});

LogOutModal.displayName = "LogOutModal";
export default LogOutModal;
