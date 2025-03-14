"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EllipsisVertical, X } from "lucide-react";
import { TickCircle } from "iconsax-react";
import getHeader from "@/lib/getHeader";
import { SessionData } from "@/types/type";
import { api } from "@/helper/external-api/apiClient";
import Image from "next/image";

interface Contact {
    name: string;
    email: string;
}

interface AddContactModalProps {
    postId: string;
    onClose: () => void;
    session: SessionData;
    onSave: (selectedContacts: Contact[]) => void;
    initialSelectedContacts?: Contact[];
}

interface UserTag {
    id: string;
    name: string;
    email: string;
    phone_number: string | null;
    allow_receive_video: string;
    picture_url: string;
}

type ApiResponse = {
    data: UserTag[];
};

export default function AddContactModal({
    postId,
    onClose,
    session,
    onSave,
    initialSelectedContacts = [],
}: AddContactModalProps) {
    const [users, setUsers] = useState<UserTag[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Contact[]>(initialSelectedContacts);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    useEffect(() => {
        async function fetchUserTags() {
            setLoading(true);
            const headers = await getHeader({ user: session.user });
            try {
                const res = await api<ApiResponse>({
                    endpoint: `api/contact`,
                    method: "GET",
                    options: { headers },
                });
                if (!res) {
                    throw new Error("Failed to fetch user tags");
                }
                setUsers(res.data);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                console.error("Error fetching user tags:", err);
                setError("Failed to load contacts");
            }
        }
        fetchUserTags();
    }, [postId, session]);

    const handleUserSelect = (user: UserTag) => {
        const contact = { name: user.name, email: user.email };
        setSelectedUsers((prev) => {
            // Only append if not already selected; do not remove an existing one.
            if (!prev.some((c) => c.email === user.email)) {
                return [...prev, contact];
            }
            return prev;
        });
    };

    const handleSave = () => {
        onSave(selectedUsers);
        onClose();
    };

    const modalVariants = {
        hidden: { opacity: 0, y: "-50%" },
        visible: { opacity: 1, y: "0%", transition: { duration: 0.3 } },
        exit: { opacity: 0, y: "-50%", transition: { duration: 0.3 } },
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-lg py-2 w-full max-w-sm h-fit max-h-[600px] flex flex-col"
            >
                <div className="flex justify-between items-center mb-2 pt-3 px-3">
                    <div className="w-full">
                        <h2 className="text-lg font-bold text-black text-center">Contact</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 w-fit">
                        <X size={24} />
                    </button>
                </div>

                <div className="divider p-0 m-0"></div>

                {loading ? (
                    <div className="w-full h-52 flex justify-center items-center">
                        <span className="loading loading-spinner loading-lg text-[#B14AE2]"></span>
                    </div>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto px-3 flex-1">
                        {users?.map((user) => {
                            const isSelected = selectedUsers.some((c) => c.email === user.email);
                            return (
                                <div
                                    key={user.id}
                                    className={`p-2 cursor-pointer flex flex-row gap-3 items-center rounded-lg ${isSelected ? "bg-[#B14AE2]/10" : "hover:bg-gray-100"
                                        }`}
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <div className="avatar">
                                        <div className="size-[50px] rounded-full">
                                            <Image src={user.picture_url} width={50} height={50} alt="avatar" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 text-black flex-1">
                                        <span className="text-sm font-bold">{user.name}</span>
                                        <span className="text-xs">{user.email}</span>
                                    </div>

                                    {isSelected ? (
                                        <TickCircle size={20} color="#B14AE2" variant="Bold" className="ml-2" />
                                    ) : (
                                        <EllipsisVertical size={20} className="text-[#858585]" />
                                    )}

                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-4 flex justify-between items-center px-3 gap-3">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 bg-gray-200 rounded-lg text-black hover:bg-gray-300"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="py-2 px-4 bg-primary rounded-lg text-white font-bold flex items-center gap-2"
                    >
                        Add
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
