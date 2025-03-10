"use client";
import Image from "next/image";
import React, { useMemo } from "react";

interface MobileFeatureModalProps {
    onClose: () => void;
}

// Example images and headings
const doodleImages = [
    "/assets/mobile-feature/mobile_feature-doodles-1.png",
    "/assets/mobile-feature/mobile_feature-doodles-2.png",
];
const headings = ["Stay calm!", "No, you’re not fall..."];

export default function MobileFeatureModal({ onClose }: MobileFeatureModalProps) {
    // Randomly pick an index to show a doodle + heading

    // Click outside => close
    function handleOverlayClick() {
        onClose();
    }

    const randomIndex = useMemo(
        () => Math.floor(Math.random() * doodleImages.length),
        []
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50"
            onClick={handleOverlayClick}>
            {/* Modal content */}
            <div
                className="fixed flex items-center justify-center right-0"
                style={{ width: "calc(100% - 203.6px)" }}
            >
                <div className="bg-white rounded-lg p-5 max-w-sm w-72 relative text-center">
                    <Image
                        src={doodleImages[randomIndex]}
                        alt="mobile doodle"
                        width={80}
                        height={80}
                        className="mx-auto mb-4 w-48 h-48 object-contain"
                    />
                    <h2 className="text-xl font-bold mb-2">{headings[randomIndex]}</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        This feature only available on mobile app at the moment. <br /><br />
                        We know this is not ideal, we will let you know once this feature available on Web app.</p>
                    <button
                        onClick={onClose}
                        className="bg-[#AF52DE] text-white px-6 py-2 rounded-md font-semibold"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
