"use client";
import React, { useState, useEffect } from "react";
import { MessageSquare, Smile } from "lucide-react";
import Lottie from "react-lottie-player";
import MobileFeatureModal from "@/components/Layout-Components/MobileFeatureModal";
import AnimateEmojiPickerModal from "./SideControlBar-Components/AnimateEmojiPickerModal";

interface SideControlBarProps {
    controlsBottomClass: string;
}

// Optionally store Lottie data in memory so repeated picks won't re-fetch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lottieCache: Record<string, any> = {};

export default function SideControlBar({ controlsBottomClass }: SideControlBarProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedData, setSelectedData] = useState<any>(null);

    // Controls whether the single-run animation has completed
    const [animationDone, setAnimationDone] = useState(false);

    const [showMobileFeatureModal, setShowMobileFeatureModal] = useState(false);

    // If user picks an emoji in the modal
    function handleSelectEmoji(emojiHex: string) {
        setSelectedEmoji(emojiHex);
    }

    // Whenever selectedEmoji changes, 
    // fetch that Lottie if not cached, and reset `animationDone`.
    useEffect(() => {
        if (!selectedEmoji) return;
        // Reset whenever a new emoji is selected.
        setAnimationDone(false);

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
            {selectedEmoji && selectedData ? (
                !animationDone ? (
                    // Single-run Lottie
                    <div className="bg-black bg-opacity-50 rounded-full p-2 flex items-center justify-center cursor-pointer">
                        <Lottie
                            onClick={() => setShowPicker(true)}
                            key={selectedEmoji}
                            animationData={selectedData}
                            loop={false}
                            play={true}
                            style={{ width: 30, height: 30 }}
                            onComplete={() => {
                                setTimeout(() => {
                                    setAnimationDone(true);
                                }, 1000);
                            }}
                        />
                    </div>
                ) : (
                    <div
                        className="bg-black bg-opacity-50 rounded-full py-0 px-2 flex items-center justify-center cursor-pointer"
                        onClick={() => setShowPicker(true)} >
                        <span className="text-[30px] text-white">
                            {String.fromCodePoint(parseInt(selectedEmoji, 16))}
                        </span>
                    </div>
                )
            ) : (
                <button
                    onClick={() => setShowPicker(true)}
                    className="bg-black bg-opacity-50 p-2 rounded-full text-white"
                >
                    <Smile size={30} />
                </button>
            )}

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

            {/** The picker modal */}
            {showPicker && (
                <AnimateEmojiPickerModal
                    onClose={() => setShowPicker(false)}
                    onSelectEmoji={handleSelectEmoji}
                />
            )}

            {/** Mobile-Only Feature Modal */}
            {showMobileFeatureModal && (
                <MobileFeatureModal onClose={() => setShowMobileFeatureModal(false)} />
            )}
        </div>
    );
}
