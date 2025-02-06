import React, { Fragment, ReactNode } from "react";
import Header from "./Layout-Components/Header";
import Drawer from "./Layout-Components/Drawer";
import Image from "next/image";

interface ComponentProps {
    children: ReactNode;
    type?: string;
}

export default async function Layout({ children, type }: ComponentProps) {
    return (
        <div className="relative bg-[url('/assets/bg-pingpong.webp')] h-fit overflow-hidden">
            <div className="relative z-10 w-full h-25">
                <Header type={type} />
            </div>
            <div className="relative w-full max-h-[650px] flex flex-row overflow-hidden">
                <div className="w-[250px]">
                    <Drawer type={type} />
                </div>
                <div className="m-0 w-full">
                    <main>{children}</main>
                </div>
            </div>
        </div>
    );
}