"use client";
import Image from "next/image";
import React, { useMemo, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    const randomIndex = useMemo(
        () => Math.floor(Math.random() * doodleImages.length),
        []
    );

    // Stop propagation so clicking inside the modal doesn't close it
    function handleModalClick(e: MouseEvent<HTMLDivElement>) {
        e.stopPropagation();
    }

    return (
        <div
            className="fixed inset-0 z-20 flex items-center justify-end bg-black bg-opacity-50 w-full"
            onClick={onClose}>
            <AnimatePresence>
                <motion.div
                    className="flex items-center justify-end bg-black bg-opacity-50 w-full"
                    // Animate overlay fade in/out
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/** The container for your modal content */}
                    <motion.div
                        className="fixed flex items-center justify-center right-0"
                        style={{ width: "calc(100% - 203.6px)" }}
                        // Animate the container from scale 0.9 to 1
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-white rounded-lg p-5 max-w-sm w-72 relative text-center"
                            onClick={handleModalClick}>
                            <Image
                                src={doodleImages[randomIndex]}
                                alt="mobile doodle"
                                width={80}
                                height={80}
                                className="mx-auto mb-4 w-48 h-48 object-contain"
                            />
                            <h2 className="text-xl font-bold mb-2">{headings[randomIndex]}</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                This feature only available on mobile app at the moment.
                                <br />
                                <br />
                                We know this is not ideal, we will let you know once this feature
                                available on Web app.
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-[#AF52DE] text-white px-6 py-2 rounded-md font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
