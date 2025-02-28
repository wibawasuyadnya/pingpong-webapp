"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import VideoAttachTitle from "./Section-Components/VideoAttachTitle";
import VideoDetailPreview from "./Section-Components/VideoDetail";

interface SectionProps {
    videoFilename: string;
    post?: string;
}

export default function Section({ videoFilename, post }: SectionProps) {
    const router = useRouter();

    // Redux fields
    const { base64Data, size } = useSelector((state: RootState) => state.video);
    // const [duration, setDuration] = useState<number | null>(null);

    // Warn user on refresh/close if we have a video in memory
    useEffect(() => {
        if (!base64Data) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // The presence of `returnValue` triggers a browser confirmation prompt
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [base64Data]);

    useEffect(() => {
        if (!base64Data) {
            console.warn("No video data in Redux; redirecting back to /upload...");
            router.push("/upload");
            return;
        }

        // We'll create a temporary hidden video to read the duration.
        const videoEl = document.createElement("video");
        videoEl.src = base64Data;
        videoEl.onloadedmetadata = () => {
            // setDuration(videoEl.duration); // in seconds
        };
        videoEl.onerror = () => {
            console.error("Failed to load metadata from base64 video");
        };
    }, [base64Data, router]);

    if (!base64Data) {
        return <p>No video data found.</p>;
    }

    // Convert size from bytes to MB
    const sizeMB = size ? (size / (1024 * 1024)).toFixed(2) : "0";

    return (
        <div className="p-8">
            <div className="space-y-5">
                <VideoAttachTitle video_size={sizeMB} video_title={videoFilename} />
                <VideoDetailPreview video_preview={base64Data}/>
            </div>
            {/* <span><strong>Duration:</strong> {duration ? `${duration.toFixed(2)}s` : "Loading..."}</span> */}
        </div>
    );
}
