"use client";
import React, { useState, useEffect, useMemo } from "react";
import Player from "next-video/player";
import { AddCircle } from "iconsax-react";
import { SendHorizonal } from "lucide-react";
import usePosterAndBlur from "@/hook/usePosterAndBlur";
import { base64ToBlob } from "@/utils/base64ToBlob";

interface VideoDetailPreviewProps {
    /** base64-encoded string, e.g. "data:video/mp4;base64,AAA..." */
    video_preview: string;
}

export default function VideoDetailPreview({ video_preview }: VideoDetailPreviewProps) {
    const [showPlayer, setShowPlayer] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);

    // Convert the base64 into a blob and object URL
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        // Convert base64 => Blob => object URL
        const blob = base64ToBlob(video_preview, "video/mp4");
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);

        // Cleanup object URL on unmount or when video_preview changes
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [video_preview]);

    // Generate a poster & blur for the poster view
    const { poster, blurDataURL, videoWidth, videoHeight } = usePosterAndBlur(video_preview, 1);

    // Calculate aspect ratio
    const aspectRatio = useMemo(() => {
        if (videoWidth && videoHeight && videoHeight !== 0) {
            return videoWidth / videoHeight;
        }
        return 16 / 9;
    }, [videoWidth, videoHeight]);

    // If ratio < 1 => portrait
    const isPortrait = aspectRatio < 1;

    // Example "Send" logic
    async function handleSend() {
        try {
            setIsUploading(true);
            setUploadSuccess(null);

            // Re-create the blob from base64
            const blob = base64ToBlob(video_preview, "video/mp4");
            const formData = new FormData();
            formData.append("video", blob, "myVideo.mp4");

            const res = await fetch("/api/video", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) {
                console.error("Upload error:", data.error || res.statusText);
                setUploadSuccess(false);
                return;
            }
            console.log("Uploaded to S3 with key:", data.filename);
            setUploadSuccess(true);
        } catch (error) {
            console.error("Upload exception:", error);
            setUploadSuccess(false);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="rounded-lg bg-white p-3">
            <div className="bg-white rounded-lg p-3 flex flex-row gap-10 justify-between items-start">
                {/* Left side form fields */}
                <div className="space-y-5 w-1/2">
                    <div className="space-y-1 flex-col flex">
                        <label htmlFor="thread_name" className="font-bold text-sm">
                            Thread name:
                        </label>
                        <input
                            type="text"
                            id="thread_name"
                            name="thread_name"
                            className="border-b-[1px] border-solid border-[#DDDDDD]"
                        />
                    </div>
                    <div className="space-y-1 flex-col flex">
                        <div className="flex flex-row justify-between items-start">
                            <label htmlFor="contact_name" className="font-bold text-sm">
                                To:
                            </label>
                            <AddCircle size="20" color="#B14AE2" variant="Bold" />
                        </div>
                        <input
                            type="text"
                            id="contact_name"
                            name="contact_name"
                            className="border-b-[1px] border-solid border-[#DDDDDD]"
                        />
                    </div>
                </div>

                {/* Right side video preview */}
                <div className="space-y-5 w-1/2">
                    <h3 className="font-bold">Video preview</h3>

                    {/* Poster or Player */}
                    {!showPlayer ? (
                        <div
                            className={`relative bg-gray-300 flex items-center justify-center cursor-pointer rounded-lg border border-gray-300 overflow-hidden ${isPortrait ? "mx-auto" : ""
                                }`}
                            style={{
                                width: isPortrait ? "50%" : "100%",
                                aspectRatio: aspectRatio.toString(),
                            }}
                            onClick={() => setShowPlayer(true)}
                        >
                            {poster && (
                                <img
                                    src={poster}
                                    alt="Poster"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    style={{
                                        filter: blurDataURL ? "blur(2px)" : "none",
                                    }}
                                />
                            )}
                            <div className="relative z-10 bg-black bg-opacity-50 rounded-full p-4">
                                <svg
                                    className="w-12 h-12 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`relative border border-gray-300 rounded-lg overflow-hidden ${isPortrait ? "mx-auto" : ""
                                }`}
                            style={{
                                width: isPortrait ? "50%" : "100%",
                                aspectRatio: aspectRatio.toString(),
                            }}
                        >
                            {objectUrl ? (
                                <Player
                                    src={objectUrl}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <p>Loading preview...</p>
                            )}
                        </div>
                    )}

                    {/* Status messages */}
                    <div className="relative pb-2">
                        {uploadSuccess === true && (
                            <div className="text-green-500 text-sm absolute right-0">
                                Upload AWS S3 Successful!
                            </div>
                        )}
                        {uploadSuccess === false && (
                            <div className="text-red-500 text-sm absolute right-0">
                                Upload AWS S3 failed.
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-row justify-between items-center pt-5 pb-10">
                        <button className="py-3 px-5 rounded-lg border-solid border-[#707070] border">
                            Replace
                        </button>
                        <div className="relative">
                            <button
                                onClick={handleSend}
                                disabled={isUploading}
                                className="flex flex-row gap-2 py-3 px-5 rounded-lg bg-[#AF52DE] font-bold text-white"
                            >
                                {isUploading ? "Uploading..." : "Send"}
                                <SendHorizonal />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
