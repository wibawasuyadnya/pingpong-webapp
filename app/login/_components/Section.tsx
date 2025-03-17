"use client";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import FlippingCircleLoader from "@/components/Layout-Components/FlippingCircleLoader";

const LoginForm = dynamic(
    () => import("./Section-Components/LoginForm"),
    {
        loading: () => <FlippingCircleLoader size={50} color="#B14AE2" duration={2} />,
        ssr: false
    }
);

export default function Section() {
    return (
        <div className="w-full min-h-[630px] flex flex-col items-center justify-center">
            <Suspense fallback={<FlippingCircleLoader size={50} color="#B14AE2" duration={2} />}>
                <LoginForm />
            </Suspense>
        </div >
    )
}