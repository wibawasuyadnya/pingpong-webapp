"use client";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import Loader from "./Section-Components/Loader";

const LoginForm = dynamic(
    () => import("./Section-Components/LoginForm"),
    {
        loading: () => <Loader />,
        ssr: false
    }
);

export default function Section() {
    return (
            <div className="w-full min-h-[630px] flex flex-row items-center justify-center">
                <Suspense fallback={<Loader />}>
                    <LoginForm />
                </Suspense>
            </div>
    )
}