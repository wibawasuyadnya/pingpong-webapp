// ScreenRecorderWithCam.tsx
"use client";
import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import Draggable from "react-draggable";
import { RotateCcw, Pause, Play, X } from "lucide-react";

interface ScreenRecorderWithCamProps {
    isRecording: boolean;
    isPaused: boolean;
    timer: number;
    onStop: () => void;
    onPause: () => void;
    onResume: () => void;
    onRetry: () => void;
    onClose: () => void;
}

export default function ScreenRecorderWithCam({
    isRecording,
    isPaused,
    timer,
    onStop,
    onPause,
    onResume,
    onRetry,
    onClose,
}: ScreenRecorderWithCamProps) {
    // For showing the small webcam overlay if desired
    const [showCameraOverlay, setShowCameraOverlay] = useState(false);
    const webcamRef = useRef<Webcam>(null);
    const draggableRef = useRef<HTMLDivElement>(null!);

    // Optional: If you want to show the webcam overlay only while recording
    React.useEffect(() => {
        if (isRecording) {
            setShowCameraOverlay(true);
        } else {
            setShowCameraOverlay(false);
        }
    }, [isRecording]);

    // Format mm:ss
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // If not recording and no overlay, do not render anything
    if (!isRecording && !showCameraOverlay) return null;

    return (
        <Draggable nodeRef={draggableRef}>
            <div
                ref={draggableRef}
                className="fixed bottom-16 right-16 flex flex-row gap-4 bg-transparent z-[9999] items-end"
            >
                {/* Circular Webcam Preview (Optional) */}
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

                {/* Control Bar */}
                {isRecording && (
                    <div className="flex flex-row justify-center items-center">
                        <div className="flex items-center justify-center gap-5 bg-black rounded-full px-10 py-2">
                            {/* Retry */}
                            <RotateCcw
                                onClick={onRetry}
                                className="text-white cursor-pointer"
                            />

                            {/* Timer */}
                            <div className="text-white px-2 py-1 rounded text-base font-bold">
                                {formatTime(timer)}
                            </div>

                            {/* Stop */}
                            <button
                                onClick={onStop}
                                className="bg-red-500 text-white border-[3px] border-white w-10 h-10 rounded-full transition hover:opacity-80"
                            />

                            {/* Pause/Resume */}
                            {!isPaused ? (
                                <div
                                    onClick={onPause}
                                    className="rounded-full border-white border-[3px] p-2 cursor-pointer"
                                >
                                    <Pause className="text-white" />
                                </div>
                            ) : (
                                <div
                                    onClick={onResume}
                                    className="rounded-full border-white border-[3px] p-2 cursor-pointer"
                                >
                                    <Play className="text-white" />
                                </div>
                            )}

                            {/* Close */}
                            <X onClick={onClose} className="text-white cursor-pointer" />
                        </div>
                    </div>
                )}
            </div>
        </Draggable>
    );
}
