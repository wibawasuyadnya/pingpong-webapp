// FakeScreenPrompt.tsx
"use client";
import React from "react";

interface FakeScreenPromptProps {
    onClose: () => void;
    onShare: (mode: "screen" | "window" | "tab") => void;
}

export default function FakeScreenPrompt({
    onClose,
    onShare,
}: FakeScreenPromptProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
            <div className="bg-white p-6 rounded-lg w-[600px]">
                <h2 className="text-xl font-bold mb-4">Choose screen</h2>

                {/* Mimics a screen selection layout */}
                <div className="space-y-5">
                    {/* Entire Screen Section */}
                    <div className="space-y-3">
                        <div className="bg-[#8E8E93] p-3 rounded-lg">
                            <span className="text-lg text-white font-semibold">
                                Entire Screen
                            </span>
                        </div>

                        <div
                            onClick={() => onShare("screen")}
                            className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer"
                        >
                            {/* Placeholder for entire screen preview */}
                            <span className="text-gray-600">[Entire Screen Preview]</span>
                        </div>
                    </div>

                    {/* Chrome Window Section */}
                    <div className="space-y-3">
                        <div className="bg-[#8E8E93] p-3 rounded-lg">
                            <span className="text-lg text-white font-semibold">
                                Chrome Window
                            </span>
                        </div>

                        <div
                            onClick={() => onShare("tab")}
                            className="flex flex-row gap-4 flex-wrap cursor-pointer"
                        >
                            <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-600">[Window 1]</span>
                            </div>
                            <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-600">[Window 2]</span>
                            </div>
                            {/* Add more placeholders as needed */}
                        </div>
                    </div>
                </div>

                {/* Cancel Button */}
                <div className="flex justify-end mt-4">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
