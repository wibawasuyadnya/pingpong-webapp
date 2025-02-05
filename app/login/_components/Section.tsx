"use client";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import Loader from "./Section-Components/Loder";

const LoginForm = dynamic(
    () => import("./Section-Components/LoginForm"),
    {
        loading: () => <Loader />,
        ssr: false
    }
);

export default function Section() {
    return (
            <div className="w-full h-[500px] flex flex-row items-center justify-center">
                <Suspense fallback={<Loader />}>
                    <LoginForm />
                </Suspense>
            </div>
    )
}