"use client";
import { usePathname } from "next/navigation";
import React from "react";

export default function Drawer({ type }: { type?: string }) {
    const pathname = usePathname();
    const isUploadPage = pathname === '/upload';
    return (
        <div className="h-full relative">
            <aside id="default-sidebar" className="overlay max-w-64 sm:absolute sm:flex sm:translate-x-0 w-full bg-transparent" role="dialog" tabIndex={-1} >
                <div className="drawer-body px-2 pt-4">
                    {
                        type !== "login" ? (
                            <ul className="menu p-0 !bg-transparent">
                                <span className="divider text-white/50 after:border-1 m-0" />
                                <li>
                                    <a className="text-lg font-semibold text-white" href="/">
                                        <span className="icon-[tabler--home] size-5 text-white py-5"></span>
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a className="text-lg font-semibold text-white " href="#">
                                        <span className="icon-[tabler--user] size-5 text-white py-5"></span>
                                        Profile
                                    </a>
                                </li>
                                <li>
                                    <a className="text-lg font-semibold text-white " href="#">
                                        <span className="icon-[ic--outline-download] size-5 text-white py-5"></span>
                                        Download app
                                    </a>
                                </li>
                                <li>
                                    <a className="text-lg font-semibold text-white" href="#">
                                        <span className="icon-[gridicons--arrow-left] size-5 text-white py-5"></span>
                                        Back to site
                                    </a>
                                </li>
                            </ul>
                        ) : (
                            <ul className="menu p-0 !bg-transparent">
                                <li>
                                    <a className="text-lg font-semibold text-white" href="#">
                                        <span className="icon-[tabler--logout-2] size-5 text-white py-5"></span>
                                        Back to site
                                    </a>
                                </li>
                            </ul>
                        )
                    }
                </div>
            </aside >
        </div >
    )
}