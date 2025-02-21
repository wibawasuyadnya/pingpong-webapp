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
}

const RecorderSection = forwardRef<RecorderSectionHandle, RecorderSectionProps>(
    ({ mode }, ref) => {
        const cameraRecorderRef = useRef<CameraRecorderHandle>(null);
        const screenRecorderRef = useRef<ScreenRecorderHandle>(null);
        const [isRecording, setIsRecording] = useState(false);

        // We define two methods for starting and stopping recording.
        const startRecording = async () => {
            if (mode === "camera") {
                await cameraRecorderRef.current?.startRecording();
            } else {
                await screenRecorderRef.current?.startRecording();
            }
            setIsRecording(true);
        };

        const stopRecording = () => {
            if (mode === "camera") {
                cameraRecorderRef.current?.stopRecording();
            } else {
                screenRecorderRef.current?.stopRecording();
            }
            setIsRecording(false);
        };

        // Expose the imperative handle so the parent can call these methods.
        useImperativeHandle(ref, () => ({
            startRecording,
            stopRecording,
        }));

        return (
            <div className="space-y-5">
                {mode === "camera" ? (
                    <CameraRecorder ref={cameraRecorderRef} />
                ) : (
                    <ScreenRecorder ref={screenRecorderRef} />
                )}
            </div>
        );
    }
);

RecorderSection.displayName = "RecorderSection";
export default RecorderSection;
