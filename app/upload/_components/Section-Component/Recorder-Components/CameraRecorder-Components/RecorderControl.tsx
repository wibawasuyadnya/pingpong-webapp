"use client";
import React from "react";
import {
    RotateCcw,
    Pause,
    Play,
    RectangleVertical,
    RectangleHorizontal,
    X,
    Square,
} from "lucide-react";

interface RecorderControlsProps {
    isRecording: boolean;
    countdown: number | null;
    timer: number;
    aspect: "portrait" | "landscape";
    formatTime: (sec: number) => string;
    onRetry: () => void;
    onRecordButtonClick: () => void;
    onPause: () => void;
    onResume: () => void;
    onChangeAspect: (val: "portrait" | "landscape") => void;
    onClose: () => void;
}

export default function RecorderControls({
    isRecording,
    countdown,
    timer,
    aspect,
    formatTime,
    onRetry,
    onRecordButtonClick,
    onPause,
    onResume,
    onChangeAspect,
    onClose,
}: RecorderControlsProps) {
    return (
        <div className="w-full flex justify-center">
            <div className="flex items-center gap-5 bg-black rounded-full px-10 py-2">
                {/* Retry Button */}
                <RotateCcw onClick={onRetry} className="text-white size-6 cursor-pointer" />

                {/* Timer Display */}
                <div className="text-white px-2 py-1 rounded text-base font-bold">
                    {formatTime(timer)}
                </div>

                {/* Record / Stop / Countdown Button */}
                <button
                    onClick={onRecordButtonClick}
                    className="transition hover:opacity-80"
                    title={!isRecording ? "Start Recording" : "Stop Recording"}
                >
                    {countdown !== null ? (
                        // Show static countdown (3, 2, or 1)
                        <div className="bg-red-500 text-white border-[3px] border-white w-10 h-10 rounded-full flex items-center justify-center text-lg">
                            {countdown}
                        </div>
                    ) : isRecording ? (
                        // Show stop (square) icon when recording
                        <div className="bg-red-500 rounded-full p-[10px]">
                            <Square className="bg-white text-white border-[3px] border-white size-5 rounded-sm" />
                        </div>
                    ) : (
                        // Default red circle (idle state)
                        <div className="bg-red-500 text-white border-[3px] border-white w-10 h-10 rounded-full" />
                    )}
                </button>

                {/* Pause / Resume Controls */}
                {isRecording && (
                    <>
                        <div
                            className="rounded-full border-white border-[3px] p-2 cursor-pointer"
                            onClick={onPause}
                        >
                            <Pause className="text-white size-5" />
                        </div>
                        <div
                            className="rounded-full border-white border-[3px] p-2 cursor-pointer"
                            onClick={onResume}
                        >
                            <Play className="text-white size-5" />
                        </div>
                    </>
                )}

                {/* Aspect Ratio Buttons */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onChangeAspect("portrait")}
                        className={`flex items-center gap-2 px-3 py-3 text-white rounded-full text-sm transition hover:opacity-80 ${aspect === "portrait" ? "bg-purple-600" : "bg-transparent"
                            }`}
                    >
                        <RectangleVertical />
                        9:16
                    </button>
                    <button
                        onClick={() => onChangeAspect("landscape")}
                        className={`flex items-center gap-2 px-3 py-3 text-white rounded-full text-sm transition hover:opacity-80 ${aspect === "landscape" ? "bg-purple-600" : "bg-transparent"
                            }`}
                    >
                        <RectangleHorizontal />
                        16:9
                    </button>
                </div>

                {/* Close Button */}
                <X onClick={onClose} className="text-white size-6 cursor-pointer" />
            </div>
        </div>
    );
}
