"use client";
import React, { Fragment } from "react";
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
    isPaused: boolean; 
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
    isPaused,
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

                <RotateCcw
                    onClick={onRetry}
                    className="text-white size-6 cursor-pointer"
                />

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
                        <div className="bg-red-500 text-white border-[3px] border-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-black">
                            {countdown}
                        </div>
                    ) : isRecording ? (
                        <div className="bg-red-500 rounded-full p-[10px]">
                            <Square className="bg-white text-white border-[3px] border-white size-5 rounded-sm" />
                        </div>
                    ) : (
                        <div className="bg-red-500 text-white border-[3px] border-white w-10 h-10 rounded-full" />
                    )}
                </button>

                {isRecording && !isPaused && (
                    <div
                        className="rounded-full border-white border-[3px] p-2 cursor-pointer"
                        onClick={onPause}
                    >
                        <Pause className="text-white size-5" />
                    </div>
                )}
                
                {isRecording && isPaused && (
                    <div
                        className="rounded-full border-white border-[3px] p-2 cursor-pointer"
                        onClick={onResume}
                    >
                        <Play className="text-white size-5" />
                    </div>
                )}

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onChangeAspect("portrait")}
                        disabled={isRecording}
                        className={`flex items-center gap-2 px-3 py-3 rounded-full text-sm transition ${aspect === "portrait"
                            ? "bg-purple-600 text-white"
                            : isRecording
                                ? "bg-transparent text-[#3A3A3A]"
                                : "bg-transparent text-white hover:opacity-80"
                            }`}
                    >
                        <RectangleVertical
                            className={`${aspect === "portrait"
                                ? "text-white"
                                : isRecording
                                    ? "text-[#3A3A3A]"
                                    : "text-white"
                                }`}
                        />
                        9:16
                    </button>
                    <button
                        onClick={() => onChangeAspect("landscape")}
                        disabled={isRecording}
                        className={`flex items-center gap-2 px-3 py-3 rounded-full text-sm transition ${aspect === "landscape"
                            ? "bg-purple-600 text-white"
                            : isRecording
                                ? "bg-transparent text-[#3A3A3A]"
                                : "bg-transparent text-white hover:opacity-80"
                            }`}
                    >
                        <RectangleHorizontal
                            className={`${aspect === "landscape"
                                ? "text-white"
                                : isRecording
                                    ? "text-[#3A3A3A]"
                                    : "text-white"
                                }`}
                        />
                        16:9
                    </button>
                </div>

                <X onClick={onClose} className="text-white size-6 cursor-pointer" />
            </div>
        </div>
    );
}
