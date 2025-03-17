"use client";
import React, { ReactNode } from "react";
import Header from "./Layout-Components/Header";
import Drawer from "./Layout-Components/Drawer";
import Footer from "./Layout-Components/Footer";
import { SessionData } from "@/types/type";
import { usePathname } from "next/navigation";
import SnackBarConnectionStatus from "./Layout-Components/SnackbarConnectionStatus";

interface ComponentProps {
    type?: string;
    children: ReactNode;
    session?: SessionData;
}

export default function Layout({ children, type, session }: ComponentProps) {
    const pathname = usePathname();
    const isNonSticky = pathname === "/" || /^\/\d+$/.test(pathname) || /^\/thread\/\d+$/.test(pathname);
    const navClassName = `${!isNonSticky ? "" : "sticky top-0"}`;

    return (
        <div className="relative">
            <div className={`z-10 w-full h-fit ${navClassName}`}>
                <Header type={type} session={session} />
            </div>
            <div className="relative w-full flex flex-row h-full">
                <div className="w-[250px]">
                    <Drawer type={type} />
                </div>
                <div className="m-0 w-full h-full">
                    <main>{children}</main>
                </div>
            </div>
            <div className="z-10 w-full h-fit">
                <Footer />
            </div>
            <SnackBarConnectionStatus />
        </div>
    );
}
