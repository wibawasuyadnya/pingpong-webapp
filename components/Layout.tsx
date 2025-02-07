"use client";
import React, { ReactNode } from "react";
import Header from "./Layout-Components/Header";
import Drawer from "./Layout-Components/Drawer";

interface ComponentProps {
    type?: string;
    children: ReactNode;
}

export default function Layout({ children, type }: ComponentProps) {
    return (
        <div className="relative">
            <div className="relative z-10 w-full h-fit">
                <Header type={type} />
            </div>
            <div className="relative w-full flex flex-row h-full">
                <div className="w-[250px]">
                    <Drawer type={type} />
                </div>
                <div className="m-0 w-full h-full">
                    <main>{children}</main>
                </div>
            </div>
        </div>
    );
}
