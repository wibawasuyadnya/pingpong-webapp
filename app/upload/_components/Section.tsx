"use client";
import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import VideoUploader from "./Section-Component/VideoUploader";
import RecorderSection, { RecorderSectionHandle } from "./Section-Component/Recorder";

export default function Section() {
    const recorderRef = useRef<RecorderSectionHandle>(null);

    // Which recording type is selected
    const [selectedRecordingType, setSelectedRecordingType] = useState("camera");
    // Are we currently recording?
    const [isRecording, setIsRecording] = useState(false);

    // Force exactly one panel open at a time:
    // "recorder" or "uploader". By default, "recorder" is open.
    const [expandedPanel, setExpandedPanel] = useState<"recorder" | "uploader">("recorder");

    // Switch to "recorder" panel. If it's already "recorder," do nothing.
    const showRecorderPanel = () => {
        setExpandedPanel((prev) => (prev === "recorder" ? "recorder" : "recorder"));
        // or simply setExpandedPanel("recorder") if you want a no-op if it's already 'recorder'
    };

    // Switch to "uploader" panel. If it's already "uploader," do nothing.
    const showUploaderPanel = () => {
        setExpandedPanel((prev) => (prev === "uploader" ? "uploader" : "uploader"));
        // or simply setExpandedPanel("uploader")
    };

    // Start/stop recording
    const handleToggleRecording = async () => {
        if (!isRecording) {
            await recorderRef.current?.startRecording();
            setIsRecording(true);
        } else {
            recorderRef.current?.stopRecording();
            setIsRecording(false);
        }
    };

    return (
        <div className="w-full p-8 space-y-5 overflow-y-scroll h-[1000px]">

            {/* ------------------------------------------- */}
            {/* ACCORDION ITEM: RECORDER                    */}
            {/* ------------------------------------------- */}
            <div className="bg-white rounded-md h-fit px-5 py-3 space-y-3">
                {/* Header (always visible) */}
                <div
                    className="flex flex-row gap-8 cursor-pointer"
                    onClick={showRecorderPanel}
                >
                    <span className="icon-[material-symbols--video-camera-front-outline] size-6 text-black"></span>
                    <h3 className="font-semibold text-base text-black">Record directly from Web app</h3>
                </div>

                {/* Body (hidden or shown with motion) */}
                <AnimatePresence initial={false}>
                    {expandedPanel === "recorder" && (
                        <motion.div
                            key="recorderBody"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-row items-stretch justify-between gap-4 h-fit pl-14 mt-4">
                                <div className="space-y-2 w-4/5">
                                    <p className="font-light text-sm text-[#707070]">
                                        Record yourself and your screen directly from our web app—
                                        perfect for presentations and pitches.
                                        <br />
                                        Click the button below to {isRecording ? "stop" : "start"} recording!
                                    </p>

                                    {/* Selection Buttons */}
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => {
                                                if (!isRecording) setSelectedRecordingType("camera");
                                            }}
                                            disabled={isRecording}
                                            className={`flex flex-row items-center gap-2 py-3 px-5 w-[400px] rounded-lg border ${selectedRecordingType === "camera"
                                                    ? "border-[#B14AE2] bg-[#F9F4FF]"
                                                    : "border-gray-300"
                                                } ${isRecording && selectedRecordingType !== "camera"
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                                }`}
                                        >
                                            {selectedRecordingType === "camera" ? (
                                                <span className="icon-[ix--circle-dot] size-5 text-[#B14AE2]" />
                                            ) : (
                                                <span className="icon-[material-symbols--circle-outline] size-5" />
                                            )}
                                            <h4 className="font-medium text-sm text-black">Camera only</h4>{" "}
                                            <span className="font-normal text-sm text-[#707070]">
                                                (default)
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (!isRecording) setSelectedRecordingType("screen");
                                            }}
                                            disabled={isRecording}
                                            className={`flex flex-row items-center gap-2 py-3 px-5 w-[400px] rounded-lg border ${selectedRecordingType === "screen"
                                                    ? "border-[#B14AE2] bg-[#F9F4FF]"
                                                    : "border-gray-300"
                                                } ${isRecording && selectedRecordingType !== "screen"
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                                }`}
                                        >
                                            {selectedRecordingType === "screen" ? (
                                                <span className="icon-[ix--circle-dot] size-5 text-[#B14AE2]" />
                                            ) : (
                                                <span className="icon-[material-symbols--circle-outline] size-5" />
                                            )}
                                            <h4 className="font-medium text-sm text-black">Screen Recording</h4>
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ------------------------------------------- */}
            {/* ACCORDION ITEM: VIDEO UPLOADER             */}
            {/* ------------------------------------------- */}
            <div className="bg-white rounded-md h-fit px-5 py-3 space-y-3">
                {/* Header (always visible) */}
                <div
                    className="flex flex-row gap-8 cursor-pointer"
                    onClick={showUploaderPanel}
                >
                    <span className="icon-[material-symbols--upload] size-6 text-black"></span>
                    <h3 className="font-semibold text-base text-black">Upload</h3>
                </div>

                {/* Body (hidden or shown with motion) */}
                <AnimatePresence initial={false}>
                    {expandedPanel === "uploader" && (
                        <motion.div
                            key="uploaderBody"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-3 mt-4">
                                <VideoUploader />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ------------------------------------------- */}
            {/* The actual RecorderSection (always in DOM)  */}
            {/* ------------------------------------------- */}
            <RecorderSection
                ref={recorderRef}
                mode={selectedRecordingType as "camera" | "screen"}
                onRecordingStatusChange={(status) => setIsRecording(status)}
            />
        </div>
    );
}
