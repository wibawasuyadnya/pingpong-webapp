"use client";
import React, { useState, useEffect } from "react";
import { MessageSquare, Smile } from "lucide-react";
import Lottie from "react-lottie-player";
import MobileFeatureModal from "@/components/Layout-Components/MobileFeatureModal";
import AnimateEmojiPickerModal from "./SideControlBar-Components/AnimateEmojiPickerModal";

interface SideControlBarProps {
    controlsBottomClass: string;
}

// Optionally store your Lottie data in memory so repeated picks won't re-fetch
const lottieCache: Record<string, any> = {};

export default function SideControlBar({ controlsBottomClass }: SideControlBarProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
    const [selectedData, setSelectedData] = useState<any>(null);
    const [showMobileFeatureModal, setShowMobileFeatureModal] = useState(false);

    // If user picks an emoji in the modal
    function handleSelectEmoji(emojiHex: string) {
        setSelectedEmoji(emojiHex);
    }

    // Whenever selectedEmoji changes, fetch that Lottie if not cached
    useEffect(() => {
        if (!selectedEmoji) return;
        if (lottieCache[selectedEmoji]) {
            setSelectedData(lottieCache[selectedEmoji]);
            return;
        }

        const url = `https://fonts.gstatic.com/s/e/notoemoji/latest/${selectedEmoji}/lottie.json`;
        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                lottieCache[selectedEmoji] = data;
                setSelectedData(data);
            })
            .catch((err) => {
                console.error("Failed to load Lottie for final usage:", err);
            });
    }, [selectedEmoji]);

    function handleMobileOnlyFeature() {
        setShowMobileFeatureModal(true);
    }


    return (
        <div className={`absolute ${controlsBottomClass} z-10 flex flex-col items-center space-y-4`}>
            {/* A button to open the emoji picker */}

            {/* If we have a chosen emoji with data, show single-run Lottie */}
            {selectedEmoji && selectedData ? (
                <div className="bg-black bg-opacity-30 rounded-full p-2 flex items-center justify-center cursor-pointer">
                    <Lottie
                        onClick={() => setShowPicker(true)}
                        key={selectedEmoji}
                        animationData={selectedData}
                        loop={false}
                        play={true}
                        style={{ width: 30, height: 30 }}
                        onComplete={() => {
                            console.log("Single-run animation ended.");
                        }}
                    />
                </div>
            ) : (
                <button
                    onClick={() => setShowPicker(true)}
                    className="bg-black bg-opacity-50 p-2 rounded-full text-white"
                >
                    <Smile size={30} />
                </button>
            )}

            {/* Example of your other buttons */}
            <button
                onClick={handleMobileOnlyFeature}
                className="bg-black bg-opacity-50 p-2 rounded-full text-white flex justify-center items-center"
            >
                <span className="icon-[material-symbols--group-outline] size-[30px]" />
            </button>
            <button
                onClick={handleMobileOnlyFeature}
                className="bg-black bg-opacity-50 p-2 rounded-full text-white flex justify-center items-center"
            >
                <span className="icon-[gg--transcript] size-[30px]" />
            </button>
            <button
                onClick={handleMobileOnlyFeature}
                className="bg-black bg-opacity-50 p-2 rounded-full text-white"
            >
                <MessageSquare size={30} className="-scale-x-[1]" />
            </button>
            <button
                onClick={handleMobileOnlyFeature}
                className="bg-black bg-opacity-50 p-2 rounded-full text-white flex justify-center items-center"
            >
                <span className="icon-[carbon--media-library] rotate-180 size-[30px] -scale-x-[1]" />
            </button>

            {/* The picker modal */}
            {showPicker && (
                <AnimateEmojiPickerModal
                    onClose={() => setShowPicker(false)}
                    onSelectEmoji={handleSelectEmoji}
                />
            )}

            {/* Mobile-Only Feature Modal */}
            {showMobileFeatureModal && (
                <MobileFeatureModal onClose={() => setShowMobileFeatureModal(false)} />
            )}
        </div>
    );
}
