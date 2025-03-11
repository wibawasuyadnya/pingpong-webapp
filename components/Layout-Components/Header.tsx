"use client";
import Image from "next/image";
import fetcher from "@/lib/fetchJson";
import { SessionData } from "@/types/type";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import React, { Fragment, useState, MouseEvent } from "react";

export default function Header({ type, session }: { type?: string, session?: SessionData }) {
    const router = useRouter();
    const [open, setOpen] = useState<boolean>(false);

    const handleLogout = async () => {
        setOpen(false);
        try {
            await fetcher("/api/auth/logout", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", (error as Error).message);
        }
    };

    function handleModalClick(e: MouseEvent<HTMLDivElement>) {
        e.stopPropagation();
    }

    return (
        <Fragment>
            <nav className="navbar bg-transparent w-full">
                <div className="flex flex-1 items-center">
                    <Image
                        src="/assets/pingpong-logo.webp"
                        alt="Background"
                        width={150}
                        height={70}
                        quality={100}
                        className="object-cover z-[-1]"
                    />
                </div>
                {
                    type !== "login" && (
                        <div className="navbar-end flex items-center gap-5">
                            <div className="avatar">
                                <div className="size-9.5 rounded-full">
                                    <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png" alt="avatar 1" />
                                </div>
                            </div>

                            <button
                                onClick={() => setOpen(true)}
                                className="bg-[#AF52DE] py-2 px-5 rounded-lg text-white text-sm font-normal">
                                Log Out
                            </button>
                        </div>
                    )
                }
            </nav>
            {
                open && (
                    <div
                        className="fixed inset-0 z-100 flex items-center justify-end bg-black bg-opacity-50 w-full"
                        role="dialog">
                        <AnimatePresence>
                            <motion.div
                                className="flex items-center justify-end bg-black bg-opacity-50 w-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setOpen(false)}
                            >
                                <motion.div
                                    className="fixed flex items-center justify-center right-0"
                                    style={{ width: "calc(100% - 203.6px)" }}
                                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                    animate={{ scale: 1, y: 0, opacity: 1 }}
                                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="bg-white rounded-lg w-[350px] min-h-[250px] flex flex-col items-center justify-center"
                                        onClick={handleModalClick}>
                                        <div className="font-bold text-xl space-y-2 p-4">
                                            <p className="text-center">
                                                Oh no you're leaving,<br />
                                                you sure you want to Log out?
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2 items-center justify-center w-full py-3 px-11">
                                            <button
                                                onClick={handleLogout}
                                                type="button"
                                                className="text-white w-full px-5 py-3 rounded-xl"
                                                style={{
                                                    background: 'linear-gradient(180deg, #D241AA 0%, #C42BDD 100%)'
                                                }}>Log out</button>
                                            <button
                                                onClick={() => setOpen(false)}
                                                type="button"
                                                className="text-black w-full px-5 py-3 rounded-xl" >
                                                No
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )
            }
        </Fragment>
    )
}