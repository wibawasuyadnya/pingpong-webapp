"use client";
import React, { useEffect, useState } from "react";
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

    // Redux fields
    const { base64Data, size, type } = useSelector((state: RootState) => state.video);

    // We'll track the upload progress, success, errors
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [uploadDone, setUploadDone] = useState(false);

    // Convert size from bytes to MB
    const sizeMB = size ? (size / (1024 * 1024)).toFixed(2) : "0";

    // If no base64, go back to /upload
    useEffect(() => {
        if (!base64Data) {
            console.warn("No video data in Redux; redirecting back to /upload...");
            router.push("/upload");
        }
    }, [base64Data, router]);

    // Warn user on refresh/close if we have a video in memory
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

    // Optional: if you want to measure duration
    // useEffect(() => {
    //   if (!base64Data) return;
    //   const videoEl = document.createElement("video");
    //   videoEl.src = base64Data;
    //   videoEl.onloadedmetadata = () => {
    //     // console.log("Duration", videoEl.duration);
    //   };
    //   videoEl.onerror = () => {
    //     console.error("Failed to load metadata from base64 video");
    //   };
    // }, [base64Data]);

    if (!base64Data) {
        return <p>No video data found.</p>;
    }

    // Convert base64 -> Blob
    function base64ToBlob(base64: string, contentType = "video/mp4"): Blob {
        const parts = base64.split(",");
        const byteCharacters = atob(parts[1]);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: contentType });
    }


    // Handler for "Send" button
    const handleSend = () => {
        if (!base64Data) return;
        setErrorMessage("");
        setProgress(0);
        setUploading(true);
        setUploadDone(false);

        // 1) Convert to Blob
        const blob = base64ToBlob(base64Data, type || "video/mp4");

        // 2) Create FormData
        const formData = new FormData();
        // You can use the videoFilename from props as the S3 object name
        const fileName = videoFilename + ".mp4";
        formData.append("video", blob, fileName);

        // 3) XHR with real progress
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/video");

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setProgress(percent);
            }
        };

        xhr.onload = () => {
            setUploading(false);
            if (xhr.status === 200) {
                setUploadDone(true);
                console.log("S3 upload success:", xhr.responseText);
            } else {
                console.error("Upload error:", xhr.status, xhr.statusText);
                setErrorMessage(`Upload failed with status ${xhr.status}`);
            }
        };

        xhr.onerror = () => {
            setUploading(false);
            setErrorMessage("Upload failed due to network error.");
        };

        xhr.send(formData);
    };

    return (
        <div className="p-8 space-y-5">
            {/* Title & basic info */}
            <VideoAttachTitle video_size={sizeMB} video_title={videoFilename} />

            {/* Show local preview from base64 */}
            <VideoDetailPreview video_preview={base64Data} post={post} session={session}/>
        </div>
    );
}
