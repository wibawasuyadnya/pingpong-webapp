"use client";
import React, { useState, useEffect, useMemo } from "react";
import Player from "next-video/player";
import { AddCircle } from "iconsax-react";
import { SendHorizonal, X } from "lucide-react";
import usePosterAndBlur from "@/hook/usePosterAndBlur";
import { base64ToBlob } from "@/utils/base64ToBlob";
import AddContactModal from "./VideoDetail-Components/AddContactModal";
import { SessionData } from "@/types/type";

interface VideoDetailPreviewProps {
    video_preview: string;
    post?: string;
    session: SessionData;
}

interface Contact {
    name: string;
    email: string;
}

export default function VideoDetailPreview({ video_preview, post, session }: VideoDetailPreviewProps) {
    const [showPlayer, setShowPlayer] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]); // Store name and email
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        const blob = base64ToBlob(video_preview, "video/mp4");
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [video_preview]);

    const { poster, blurDataURL, videoWidth, videoHeight } = usePosterAndBlur(video_preview, 1);

    const aspectRatio = useMemo(() => {
        if (videoWidth && videoHeight && videoHeight !== 0) {
            return videoWidth / videoHeight;
        }
        return 16 / 9;
    }, [videoWidth, videoHeight]);

    const isPortrait = aspectRatio < 1;

    async function handleSend() {
        try {
            setIsUploading(true);
            setUploadSuccess(null);

            const blob = base64ToBlob(video_preview, "video/mp4");
            const formData = new FormData();
            formData.append("video", blob, "myVideo.mp4");
            formData.append("thread_name", "My First Video PWA"); // Example thread_name
            selectedContacts.forEach((contact) => formData.append("cc_users[]", contact.email)); // Send only emails

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

    const handleAddContact = () => {
        setIsModalOpen(true);
    };

    const handleSaveContacts = (contacts: Contact[]) => {
        setSelectedContacts(contacts);
    };

    const handleRemoveContact = (email: string) => {
        setSelectedContacts((prev) => prev.filter((contact) => contact.email !== email));
    };

    return (
        <div className="rounded-lg bg-white p-3">
            <div className="bg-white rounded-lg p-3 flex flex-row gap-10 justify-between items-start">
                {/* Left side form fields */}
                <div className="space-y-5 w-1/2">
                    <div className="space-y-1 flex-col flex">
                        <label htmlFor="thread_name" className="font-bold text-sm text-black">
                            Thread name:
                        </label>
                        <input
                            type="text"
                            id="thread_name"
                            name="thread_name"
                            className="border-b-[1px] border-solid border-[#DDDDDD] text-black"
                        />
                    </div>
                    <div className="space-y-1 flex-col flex">
                        <div className="flex flex-row justify-between items-start">
                            <label htmlFor="contact_name" className="font-bold text-sm text-black">
                                To:
                            </label>
                            <AddCircle
                                size="20"
                                color="#B14AE2"
                                variant="Bold"
                                onClick={handleAddContact}
                                style={{ cursor: "pointer" }}
                            />
                        </div>
                        <input
                            type="text"
                            id="contact_name"
                            name="contact_name"
                            className="border-b-[1px] border-solid border-[#DDDDDD] text-black"
                            disabled
                        />
                        {/* Display selected contacts */}
                        <div className="pt-2 flex flex-wrap gap-2">
                            {selectedContacts.map((contact) => (
                                <div
                                    key={contact.email}
                                    className="flex flex-row items-center gap-3 bg-[#B14AE2]/20 pl-5 pr-3 py-2 rounded-full text-sm text-black  justify-between w-fit border-solid border-2 border-[#DDDDDD]"
                                >
                                    <span className="text-black font-semibold text-sm">{contact.name}</span>
                                    <button
                                        onClick={() => handleRemoveContact(contact.email)}
                                        className="text-black hover:text-black"
                                    >
                                        <X />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side video preview */}
                <div className="space-y-5 w-1/2">
                    <h3 className="font-bold text-black">Video preview</h3>

                    {!showPlayer ? (
                        <div
                            className={`relative bg-gray-300 flex items-center justify-center cursor-pointer rounded-lg border border-gray-300 overflow-hidden ${isPortrait ? "mx-auto" : ""}`}
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
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`relative border border-gray-300 rounded-lg overflow-hidden ${isPortrait ? "mx-auto" : ""}`}
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

                    <div className="flex flex-row justify-between items-center pt-5 pb-10">
                        <button className="py-3 px-5 rounded-lg border-solid border-[#707070] border text-black">
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

            {isModalOpen && post && (
                <AddContactModal
                    postId={post}
                    onClose={() => setIsModalOpen(false)}
                    session={session}
                    onSave={handleSaveContacts}
                />
            )}
        </div>
    );
}