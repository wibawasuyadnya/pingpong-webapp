import React, { Fragment, ReactNode } from "react";
import Header from "./Layout-Components/Header";
import Drawer from "./Layout-Components/Drawer";

interface ComponentProps {
    children: ReactNode;
};


export default async function Layout({ children }: ComponentProps) {
    return (
        <Fragment>
            <div className="z-10 w-full">
                <Header />
            </div>
            <div className="w-full flex flex-row h-screen">
                <div className="relative w-[250px]">
                    <Drawer />
                </div>
                <div className={`m-0 px-10 py-8 bg-[#f8f8f8] w-full`}>
                    <main>{children}</main>
                </div>
            </div>
        </Fragment>
    );
}