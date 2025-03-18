"use client";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { SessionData } from "@/types/type";
import { ProfileCircle } from "iconsax-react";
import React, { Fragment, useRef } from "react";
import LogOutModal, { LogOutModalHandle } from "./Header-Components/LogOutModal";

export default function Header({
    type,
    session,
}: {
    type?: string;
    session?: SessionData;
}) {
    const modalRef = useRef<LogOutModalHandle>(null);

    const openDialog = () => {
        modalRef.current?.show();
    };

    return (
        <Fragment>
            <nav className="navbar bg-transparent w-full z-[999]">
                <div className="flex flex-1 items-center">
                    <Image
                        src="/assets/pingpong-logo.webp"
                        alt="Background"
                        width={150}
                        height={70}
                        quality={100}
                        className="object-cover"
                    />
                </div>
                {type !== "login" && (
                    <div className="navbar-end flex items-center gap-5">
                        <div className="avatar">
                            {session?.picture ? (
                                <div className="w-10 h-10">
                                    <Image
                                        src={session.picture}
                                        alt="profile"
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            ) : (
                                <ProfileCircle size="32" color="#BE41D2" variant="Bold" />
                            )}
                        </div>
                        <div className="bg-[#AF52DE] py-2 px-5 rounded-lg flex flex-row gap-2">
                            <LogOut color="white" />
                            <button onClick={openDialog} className="text-white text-sm font-semibold">
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            <LogOutModal ref={modalRef} />
        </Fragment>
    );
}
