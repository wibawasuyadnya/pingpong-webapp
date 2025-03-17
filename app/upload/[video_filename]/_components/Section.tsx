"use client";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import VideoAttachTitle from "./Section-Components/VideoAttachTitle";
import VideoDetailPreview from "./Section-Components/VideoDetail";
import { SessionData } from "@/types/type";

interface SectionProps {
    videoFilename: string;
    post?: string;
    session: SessionData;
}

export default function Section({ videoFilename, post, session }: SectionProps) {
    const router = useRouter();
    const { base64Data, size } = useSelector((state: RootState) => state.video);
    const sizeMB = size ? (size / (1024 * 1024)).toFixed(2) : "0";

    useEffect(() => {
        if (!base64Data) {
            console.warn("No video data in Redux; redirecting back to /upload...");
            router.push("/upload");
        }
    }, [base64Data, router]);

    useEffect(() => {
        if (!base64Data) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [base64Data]);

    if (!base64Data) {
        return <p>No video data found.</p>;
    }

    return (
        <div className="p-8 space-y-5">
            {/* Title & basic info */}
            <VideoAttachTitle video_size={sizeMB} video_title={videoFilename} />

            {/* Show local preview from base64 */}
            <VideoDetailPreview video_preview={base64Data} post={post} session={session} video_filename={videoFilename} />
        </div>
    );
}
