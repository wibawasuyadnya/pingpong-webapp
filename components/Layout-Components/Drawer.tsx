"use client";
import Link from "next/link";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface DrawerProps {
    type?: string;
}

export default function Drawer({ type }: DrawerProps) {
    const pathname = usePathname();
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    const links = [
        { href: "/", label: "Home", icon: "icon-[tabler--home]" },
        { href: "/profile", label: "Profile", icon: "icon-[tabler--user]" },
        { href: "#", label: "Download app", icon: "icon-[ic--outline-download]" },
    ];

    const springTransition = {
        type: "spring",
        stiffness: 300,
        damping: 10,
        bounce: 0.4,
    };

    if (type === "login") {
        return null;
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
                        {links.map((link) => {
                            let isActive: boolean;
                            if (link.href === "/") {
                                isActive =
                                    pathname === "/" ||
                                    /^\/\d+$/.test(pathname) ||
                                    /^\/thread\/\d+$/.test(pathname);
                            } else {
                                isActive = pathname === link.href;
                            }
                            return (
                                <motion.li
                                    key={link.href}
                                    onHoverStart={() => setHoveredLink(link.href)}
                                    onHoverEnd={() => setHoveredLink(null)}
                                    animate={{
                                        scale: 1,
                                        borderLeftWidth: hoveredLink === link.href ? "3px" : "0px",
                                        borderLeftColor: hoveredLink === link.href ? "#BE41D2" : "transparent"
                                    }}
                                    transition={springTransition}
                                    className="overflow-hidden"
                                >
                                    <Link
                                        href={link.href}
                                        className="text-lg font-semibold text-white"
                                    >
                                        <span
                                            className={`${link.icon} size-5 py-5 ${isActive ? "text-[#BE41D2]" : "text-white"}`}
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
