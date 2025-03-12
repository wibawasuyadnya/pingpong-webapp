"use client";
import React, { useState, useEffect, useMemo } from "react";
import Player from "next-video/player";
import { AddCircle } from "iconsax-react";
import { SendHorizonal, X } from "lucide-react";
import usePosterAndBlur from "@/hook/usePosterAndBlur";
import { base64ToBlob } from "@/utils/base64ToBlob";
import AddContactModal from "./VideoDetail-Components/AddContactModal";
import { SessionData, Video } from "@/types/type";
import getHeader from "@/lib/getHeader";
import { api } from "@/helper/external-api/apiClient";
import { apiUrl } from "@/utils/envConfig";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearVideo } from "@/redux/slices/videoSlice";

interface VideoDetailPreviewProps {
    video_preview: string;
    post?: string;
    session: SessionData;
    video_filename: string;
}

interface Contact {
    name: string;
    email: string;
}

interface UserTag {
    id: string;
    name: string;
    email: string;
    phone_number: string | null;
    allow_receive_video: string;
    picture_url: string;
}

interface ApiResponse {
    data: Video[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

interface S3ObjectKeyResponse {
    key: string;
}

export default function VideoDetailPreview({
    video_preview,
    post,
    session,
    video_filename,
}: VideoDetailPreviewProps) {
    const router = useRouter();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [showPlayer, setShowPlayer] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [threadName, setThreadName] = useState<string>("");
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
    const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);

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

    async function fetchUserTags() {
        setLoading(true);
        const headers = await getHeader({ user: session.user });
        try {
            const res = await api<{ data: UserTag[] }>({
                endpoint: `api/video/${post}/user-tag`,
                method: "GET",
                options: { headers },
            });
            if (!res) {
                throw new Error("Failed to fetch user tags");
            }
            const contacts: Contact[] = res.data.map((tag) => ({
                name: tag.name,
                email: tag.email,
            }));
            setSelectedContacts(contacts);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.error("Error fetching user tags:", err);
            setError("Failed to load contacts");
        }
    }

    async function fetchThread({ post }: { post: string }) {
        setLoading(true);
        const headers = await getHeader({ user: session.user });
        const params = {
            limit: 1
        }
        try {
            const res = await api<ApiResponse>({
                endpoint: `api/thread/${post}`,
                method: "GET",
                options: {
                    headers,
                    params
                },
            });
            setLoading(false);
            setThreadName(res.data[0].thread_name);
        } catch (err) {
            setLoading(false);
            console.error("Error fetching thread:", err);
            setError("Failed to load thread");
        }
    }

    useEffect(() => {
        if (post && post !== "new") {
            fetchThread({ post });
            fetchUserTags();
        } else {
            setLoading(false);
        }
    }, [post]);

    async function handleSend() {
        const headers = await getHeader({ user: session.user });
        try {
            setIsUploading(true);
            setUploadSuccess(null);

            const blob = base64ToBlob(video_preview, "video/mp4");
            const keyFormData = new FormData();
            keyFormData.append("file_name", `${video_filename}`);

            const keyRes = await fetch(`${apiUrl}/api/video/s3-object-key`, {
                method: "POST",
                headers: headers,
                body: keyFormData,
            });

            const keyData: S3ObjectKeyResponse = await keyRes.json();

            if (!keyRes.ok || !keyData.key) {
                throw new Error("Failed to fetch S3 object key");
            }

            const objectKey = keyData.key;
            const formData = new FormData();
            formData.append("video", blob, "myVideo.mp4");
            formData.append("objectKey", objectKey);

            const s3Res = await fetch("/api/video", {
                method: "POST",
                body: formData,
            });

            const s3Data = await s3Res.json();

            if (!s3Res.ok) {
                console.error("S3 Upload error:", s3Data.error || s3Res.statusText);
                setUploadSuccess(false);
                setError("Failed to upload video to S3");
                setIsUploading(false);
                return;
            }

            const metadataFormData = new FormData();

            if (post && post !== "new") {
                metadataFormData.append("parent_id", post);
            }
            metadataFormData.append("video", `${video_filename}.mp4`);
            metadataFormData.append("thread_name", threadName);
            selectedContacts.forEach((contact) => metadataFormData.append("cc_users[]", contact.email));

            const metadataRes = await fetch(`${apiUrl}/api/video`, {
                method: "POST",
                headers: headers,
                body: metadataFormData,
            });

            const metadataData = await metadataRes.json();

            if (!metadataRes.ok) {
                console.error("Metadata upload error:", metadataData.error || metadataRes.statusText);
                setUploadSuccess(false);
                setError("Failed to submit video metadata");
                setIsUploading(false);
                return;
            }

            console.log("Metadata uploaded successfully:", metadataData);
            setUploadSuccess(true);
            router.push("/");
        } catch (error) {
            console.error("Upload exception:", error);
            setUploadSuccess(false);
            setError("An error occurred during upload");
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

    const handleReplace = () => {
        dispatch(clearVideo());
        router.back();
    };

    return (
        <div className="rounded-lg bg-white p-3">
            <div className="bg-white rounded-lg p-3 flex flex-row gap-10 justify-between items-start">
                <div className="space-y-5 w-1/2">
                    <div className="space-y-1 flex-col flex">
                        <label htmlFor="thread_name" className="font-bold text-sm text-black">
                            Thread name:
                        </label>
                        <input
                            type="text"
                            id="thread_name"
                            name="thread_name"
                            value={threadName}
                            onChange={(e) => setThreadName(e.target.value)}
                            className="border-b-[1px] border-solid border-[#DDDDDD] text-black font-semibold text-lg"
                            disabled={loading}
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
                        <div className="pt-2 flex flex-wrap gap-2">
                            {selectedContacts.map((contact) => (
                                <div
                                    key={contact.email}
                                    className="flex flex-row items-center gap-3 bg-[#B14AE2]/20 pl-5 pr-3 py-2 rounded-full text-sm text-black justify-between w-fit border-solid border-2 border-[#DDDDDD]"
                                >
                                    <span className="text-black font-semibold text-sm">{contact.name}</span>
                                    <button onClick={() => handleRemoveContact(contact.email)} className="text-black hover:text-black">
                                        <X />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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
                                <Player src={objectUrl} controls autoPlay className="w-full h-full object-cover" />
                            ) : (
                                <p>Loading preview...</p>
                            )}
                        </div>
                    )}
                    <div className="relative pb-2">
                        {uploadSuccess === true && <div className="text-green-500 text-sm absolute right-0">Upload AWS S3 Successful!</div>}
                        {uploadSuccess === false && <div className="text-red-500 text-sm absolute right-0">Upload AWS S3 failed: {error}</div>}
                    </div>
                    <div className="flex flex-row justify-between items-center pt-5 pb-10">
                        <button
                            onClick={handleReplace}
                            type={"button"}
                            className="py-3 px-5 rounded-lg border-solid border-[#707070] border text-black"
                        >
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
                <AddContactModal postId={post} onClose={() => setIsModalOpen(false)} session={session} onSave={handleSaveContacts} />
            )}
        </div>
    );
}