"use client";
import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
} from "react";
import CameraRecorder, {
    CameraRecorderHandle,
} from "./Recorder-Components/CameraRecorder";
import ScreenRecorder, {
    ScreenRecorderHandle,
} from "./Recorder-Components/ScreenRecorder";

export interface RecorderSectionHandle {
    startRecording: () => Promise<void>;
    stopRecording: () => void;
}

interface RecorderSectionProps {
    mode: "camera" | "screen";
    onRecordingStatusChange?: (isRecording: boolean) => void;
    replyVideo: string | undefined;
}

const RecorderSection = forwardRef<RecorderSectionHandle, RecorderSectionProps>(
    ({ mode, onRecordingStatusChange, replyVideo }, ref) => {
        const cameraRecorderRef = useRef<CameraRecorderHandle>(null);
        const screenRecorderRef = useRef<ScreenRecorderHandle>(null);

        const startRecording = async () => {
            if (mode === "camera") {
                await cameraRecorderRef.current?.startRecording();
            } else {
                await screenRecorderRef.current?.startRecording();
            }
            onRecordingStatusChange?.(true);
        };

        const stopRecording = () => {
            if (mode === "camera") {
                cameraRecorderRef.current?.stopRecording();
            } else {
                screenRecorderRef.current?.stopRecording();
            }
            onRecordingStatusChange?.(false);
        };

        useImperativeHandle(ref, () => ({
            startRecording,
            stopRecording,
        }));

        return (
            <div className="space-y-5">
                {mode === "camera" ? (
                    <CameraRecorder
                        ref={cameraRecorderRef}
                        replyVideo={replyVideo}
                        onRecordingStatusChange={onRecordingStatusChange}
                    />
                ) : (
                    <ScreenRecorder
                        ref={screenRecorderRef}
                        replyVideo={replyVideo}
                        onRecordingStatusChange={onRecordingStatusChange}
                    />
                )}
            </div>
        );
    }
);

RecorderSection.displayName = "RecorderSection";
export default RecorderSection;
