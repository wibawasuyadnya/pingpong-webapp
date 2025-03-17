"use client";
import React, { useEffect, useState, MouseEvent } from "react";
import Lottie from "react-lottie-player";
// import { setVideoOrientation } from "@/redux/slices/orientationSlice"; // If needed
// import { useAppDispatch } from "@/redux/hook"; // If needed

// Example data
const EMOJI = {
    data: [
        {
            codes_1: [
                "2764_fe0f",
                "1f44d",
                "1f602",
                "1f62f",
                "1f622",
                "1f44f",
                "1f60e",
                "1f4af",
                "1f525",
            ],
        },
        {
            codes_2: [
                "1f4a9",
                "1f649",
                "1f47b",
                "1f37b",
                "1f339",
                "1f48b",
                "1f416",
                "1f382",
                "1f92e",
            ],
        },
    ],
};

interface AnimateEmojiPickerModalProps {
    onClose: () => void;
    onSelectEmoji: (emojiHex: string) => void;
}

export default function AnimateEmojiPickerModal({
    onClose,
    onSelectEmoji,
}: AnimateEmojiPickerModalProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lottieMap, setLottieMap] = useState<Record<string, any>>({});
    const allCodes = React.useMemo(() => {
        const result: string[] = [];
        EMOJI.data.forEach((group) => {
            const codesArray = Object.values(group)[0] as string[];
            result.push(...codesArray);
        });
        return result;
    }, []);

    // Fetch each emoji’s Lottie data on mount
    useEffect(() => {
        allCodes.forEach((emojiHex) => {
            const url = `https://fonts.gstatic.com/s/e/notoemoji/latest/${emojiHex}/lottie.json`;
            fetch(url)
                .then((res) => res.json())
                .then((data) => {
                    setLottieMap((prev) => ({ ...prev, [emojiHex]: data }));
                })
                .catch((err) => {
                    console.error("Failed to load Lottie emoji:", emojiHex, err);
                });
        });
    }, [allCodes]);

    // Click outside => close
    function handleOverlayClick() {
        onClose();
    }

    // Prevent the modal itself from triggering the outside click
    function handleModalClick(e: MouseEvent<HTMLDivElement>) {
        e.stopPropagation();
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50"
            onClick={handleOverlayClick}
        >
            <div
                className="fixed flex items-center justify-center right-0"
                style={{ width: "calc(100% - 203.6px)" }}
            >
                {/* Modal Content */}
                <div
                    className="container-snap no-scrollbar bg-black/50 rounded-lg p-5 max-w-sm w-[300px] max-h-[350px] relative overflow-x-auto whitespace-nowrap snap-x snap-mandatory"
                    onClick={handleModalClick}
                >
                    {EMOJI.data.map((group, pageIndex) => {
                        const codesArray = Object.values(group)[0] as string[];

                        return (
                            <div
                                key={pageIndex}
                                className="inline-block align-top w-full h-full shrink-0 px-2 snap-center snap-always"
                            >
                                <div className="grid grid-cols-3 gap-3 place-items-center w-full h-full">
                                    {codesArray.map((emojiHex) => {
                                        const lottieData = lottieMap[emojiHex];
                                        return (
                                            <button
                                                key={emojiHex}
                                                onClick={() => {
                                                    onSelectEmoji(emojiHex);
                                                    onClose();
                                                }}
                                                className="w-20 h-20 flex items-center justify-center rounded-lg hover:scale-110 transition-transform"
                                            >
                                                {lottieData ? (
                                                    <Lottie
                                                        loop
                                                        play
                                                        animationData={lottieData}
                                                        style={{ width: 50, height: 50 }}
                                                    />
                                                ) : (
                                                    // Fallback text if Lottie is still loading
                                                    <span className="text-xs text-white">{emojiHex}</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
