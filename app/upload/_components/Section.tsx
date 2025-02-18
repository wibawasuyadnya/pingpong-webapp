"use client";
import React, { useRef, useState } from "react";
import VideoUploader from "./Section-Component/VideoUploader";
import RecorderSection, { RecorderSectionHandle } from "./Section-Component/Recorder";

export default function Section() {
    // Create a ref to access RecorderSection's imperative methods.
    const recorderRef = useRef<RecorderSectionHandle>(null);

    // Local state for recording mode; default is "camera".
    const [selectedRecordingType, setSelectedRecordingType] = useState("camera");

    // Local state to track if recording is in progress.
    const [isRecording, setIsRecording] = useState(false);

    // Toggle recording: start recording if not recording, otherwise stop.
    const handleToggleRecording = () => {
        if (!isRecording) {
            // Start recording.
            recorderRef.current?.startRecording();
            setIsRecording(true);
        } else {
            // Stop recording.
            recorderRef.current?.stopRecording();
            setIsRecording(false);
        }
    };

    return (
        <div className="w-full p-8 space-y-5 overflow-y-scroll h-[1000px]">
            {/* Recording Options Card */}
            <div className="bg-white rounded-md h-fit px-5 py-8 space-y-3">
                <div className="flex flex-row items-stretch justify-between gap-4 h-fit">
                    <span className="icon-[material-symbols--video-camera-front-outline] size-6"></span>
                    <div className="space-y-2 w-4/5">
                        <h3 className="font-semibold text-base">
                            Record directly from Web app
                        </h3>
                        <p className="font-light text-sm text-[#707070]">
                            Record yourself and your screen directly from our web app—perfect for
                            presentations and pitches.
                            <br />
                            Click the button below to {isRecording ? "stop" : "start"} recording!
                        </p>
                        {/* Selection Buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={() => setSelectedRecordingType("camera")}
                                className={`flex flex-row items-center gap-2 py-3 px-5 w-[400px] rounded-lg border ${selectedRecordingType === "camera"
                                    ? "border-[#B14AE2] bg-[#F9F4FF]"
                                    : "border-gray-300"
                                    }`}
                            >
                                {selectedRecordingType === "camera" ? (
                                    <span className="icon-[ix--circle-dot] size-5 text-[#B14AE2]" />
                                ) : (
                                    <span className="icon-[material-symbols--circle-outline] size-5" />
                                )}
                                <h4 className="font-medium text-sm">Camera only</h4>
                            </button>
                            <button
                                onClick={() => setSelectedRecordingType("screen")}
                                className={`flex flex-row items-center gap-2 py-3 px-5 w-[400px] rounded-lg border ${selectedRecordingType === "screen"
                                    ? "border-[#B14AE2] bg-[#F9F4FF]"
                                    : "border-gray-300"
                                    }`}
                            >
                                {selectedRecordingType === "screen" ? (
                                    <span className="icon-[ix--circle-dot] size-5 text-[#B14AE2]" />
                                ) : (
                                    <span className="icon-[material-symbols--circle-outline] size-5" />
                                )}
                                <h4 className="font-medium text-sm">Screen Recording</h4>
                            </button>
                        </div>
                    </div>
                    <div className="relative w-fit flex flex-col justify-end">
                        <button
                            onClick={handleToggleRecording}
                            className="border border-[#FF2D55] border-solid py-2 px-5 text-[#FF2D55] font-medium rounded-lg text-sm"
                        >
                            {isRecording ? "Stop recording" : "Start recording"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Video Uploader */}
            <VideoUploader />

            {/* RecorderSection with mode prop */}
            <RecorderSection
                ref={recorderRef}
                mode={selectedRecordingType as "camera" | "screen"}
            />
        </div>
    );
}
