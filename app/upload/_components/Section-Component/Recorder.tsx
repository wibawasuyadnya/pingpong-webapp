"use client";
import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
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
}

const RecorderSection = forwardRef<RecorderSectionHandle, RecorderSectionProps>(
    ({ mode, onRecordingStatusChange }, ref) => {
        const cameraRecorderRef = useRef<CameraRecorderHandle>(null);
        const screenRecorderRef = useRef<ScreenRecorderHandle>(null);
        const [isRecording, setIsRecording] = useState(false);

        const startRecording = async () => {
            if (mode === "camera") {
                await cameraRecorderRef.current?.startRecording();
            } else {
                await screenRecorderRef.current?.startRecording();
            }
            setIsRecording(true);
            onRecordingStatusChange?.(true);
        };

        const stopRecording = () => {
            if (mode === "camera") {
                cameraRecorderRef.current?.stopRecording();
            } else {
                screenRecorderRef.current?.stopRecording();
            }
            setIsRecording(false);
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
                        onRecordingStatusChange={onRecordingStatusChange}
                    />
                ) : (
                    <ScreenRecorder
                        ref={screenRecorderRef}
                        onRecordingStatusChange={onRecordingStatusChange}
                    />
                )}
            </div>
        );
    }
);

export default RecorderSection;
