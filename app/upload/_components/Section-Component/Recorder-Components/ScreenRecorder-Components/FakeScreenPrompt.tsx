"use client";
import React, { Fragment } from "react";

type DisplaySurfaceOption = "monitor" | "window" | "browser";

interface FakeScreenPromptProps {
    onClose: () => void;
    onConfirm: (dummyImage: string, mode: DisplaySurfaceOption) => void;
}

export default function FakeScreenPrompt({ onClose, onConfirm }: FakeScreenPromptProps) {
    // Simply return the chosen mode without triggering any native prompt.
    const handleModeSelect = (mode: DisplaySurfaceOption) => {
        onConfirm("", mode);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-[9999]">
            <div className="bg-white p-6 rounded-lg w-[600px]">
                <h2 className="text-xl font-bold mb-4">Select Screen Recording Mode</h2>
                <p>Select one of the options below:</p>
                <div className="flex flex-row gap-4 my-4">
                    <button
                        style={{ background: "linear-gradient(180deg, #D241AA 0%, #C42BDD 100%)" }}
                        className="text-white px-10 py-2 rounded-lg font-semibold text-lg w-fit"
                        onClick={() => handleModeSelect("monitor")}
                    >
                        Fullscreen
                    </button>
                    <button
                        style={{ background: "linear-gradient(180deg, #D241AA 0%, #C42BDD 100%)" }}
                        className="text-white px-10 py-2 rounded-lg font-semibold text-lg w-fit"
                        onClick={() => handleModeSelect("window")}
                    >
                        Window
                    </button>
                    <button
                        style={{ background: "linear-gradient(180deg, #D241AA 0%, #C42BDD 100%)" }}
                        className="text-white px-10 py-2 rounded-lg font-semibold text-lg w-fit"
                        onClick={() => handleModeSelect("browser")}
                    >
                        Tab
                    </button>
                </div>
            </div>
        </div>
    );
}
