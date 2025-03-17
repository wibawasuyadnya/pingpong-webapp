"use client";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface DrawerProps {
    type?: string;
}

export default function Drawer({ type }: DrawerProps) {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home", icon: "icon-[tabler--home]" },
        { href: "/profile", label: "Profile", icon: "icon-[tabler--user]" },
        { href: "/download", label: "Download app", icon: "icon-[ic--outline-download]" },
        { href: "/back", label: "Back to site", icon: "icon-[gridicons--arrow-left]" },
    ];

    const hoverAnimation = {
        borderLeftWidth: "3px",
        borderLeftColor: "#800080", 
    };

    if (type === "login") {
        return (
            <div className="h-full relative">
                <aside
                    id="default-sidebar"
                    className="overlay max-w-64 sm:absolute sm:flex sm:translate-x-0 w-full bg-transparent"
                    role="dialog"
                    tabIndex={-1}
                >
                    <div className="drawer-body px-2 pt-4">
                        <ul className="menu p-0 !bg-transparent">
                            <motion.li
                                whileHover={hoverAnimation}
                                transition={{ duration: 0.2 }}
                                className="border-l-2"
                            >
                                <a className="text-lg font-semibold text-white" href="#">
                                    <span
                                        className={`icon-[tabler--logout-2] size-5 py-5 ${pathname === "/logout" ? "text-purple-500" : "text-white"
                                            }`}
                                    ></span>
                                    Back to site
                                </a>
                            </motion.li>
                        </ul>
                    </div>
                </aside>
            </div>
        );
    }

    return (
        <div className="h-full relative">
            <aside
                id="default-sidebar"
                className="overlay max-w-64 sm:absolute sm:flex sm:translate-x-0 w-full bg-transparent"
                role="dialog"
                tabIndex={-1}
            >
                <div className="drawer-body px-2 pt-4">
                    <ul className="menu p-0 !bg-transparent">
                        <span className="divider text-white/50 after:border-1 m-0" />
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <motion.li
                                    key={link.href}
                                    whileHover={hoverAnimation}
                                    transition={{ duration: 0.3 }}
                                    className="border-l-0"
                                >
                                    <Link
                                        href={link.href}
                                        className={`text-lg font-semibold ${isActive ? "text-purple-500" : "text-white"
                                            }`}
                                    >
                                        <span
                                            className={`${link.icon} size-5 py-5 ${isActive ? "text-purple-500" : "text-white"
                                                }`}
                                        ></span>
                                        {link.label}
                                    </Link>
                                </motion.li>
                            );
                        })}
                    </ul>
                </div>
            </aside>
        </div>
    );
}
