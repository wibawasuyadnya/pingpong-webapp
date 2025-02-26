"use client";
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import Draggable from "react-draggable";
import { Pause, Play, X, Square } from "lucide-react";

interface ScreenRecorderWithCamProps {
    isRecording: boolean;
    isPaused: boolean;
    timer: number;
    countdown: number | null;
    onRecordButtonClick: () => void;
    onStop?: () => void;
    onPause: () => void;
    onResume: () => void;
    onRetry?: () => void;
    onClose: () => void;
    showUI: boolean;
}

export default function ScreenRecorderWithCam({
    isRecording,
    isPaused,
    timer,
    countdown,
    onRecordButtonClick,
    onPause,
    onResume,
    onClose,
    showUI,
}: ScreenRecorderWithCamProps) {
    const [showCameraOverlay, setShowCameraOverlay] = useState(false);
    const webcamRef = useRef<Webcam>(null);
    const draggableRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;

    useEffect(() => {
        setShowCameraOverlay(isRecording || showUI);
    }, [isRecording, showUI]);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    if (!showUI && !isRecording && !showCameraOverlay) return null;

    return (
        <Draggable nodeRef={draggableRef}>
            <section
                ref={draggableRef}
                className="fixed bottom-16 right-16 flex flex-row gap-4 bg-transparent z-[9999] items-end"
            >
                {showCameraOverlay && (
                    <div style={{ width: "150px", height: "150px" }}>
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#B14AE2]">
                            <Webcam
                                ref={webcamRef}
                                videoConstraints={{ facingMode: "user" }}
                                audio={false}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-row justify-center items-center">
                    <div className="flex items-center justify-center gap-5 bg-black rounded-full px-10 py-2">
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
                                    <Square className="bg-white text-white border-[3px] border-white rounded-sm" />
                                </div>
                            ) : (
                                <div className="bg-red-500 text-white border-[3px] border-white w-10 h-10 rounded-full" />
                            )}
                        </button>
                        <div className="text-white px-2 py-1 rounded text-base font-bold">
                            {formatTime(timer)}
                        </div>
                        {!isPaused ? (
                            <div onClick={onPause} className="rounded-full border-white border-[3px] p-2 cursor-pointer">
                                <Pause className="text-white" />
                            </div>
                        ) : (
                            <div onClick={onResume} className="rounded-full border-white border-[3px] p-2 cursor-pointer">
                                <Play className="text-white" />
                            </div>
                        )}
                        <X onClick={onClose} className="text-white cursor-pointer" />
                    </div>
                </div>
            </section>
        </Draggable>
    );
}
