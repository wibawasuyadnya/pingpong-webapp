// ScreenRecorder.tsx
"use client";
import React, {
    useImperativeHandle,
    useRef,
    useState,
    forwardRef,
} from "react";
import ScreenRecorderWithCam from "./ScreenRecorder-Components/ScreenRecorderWithCam";

export interface ScreenRecorderHandle {
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    recordedBlob: Blob | null;
    isRecording: boolean;
}

// This component holds all MediaRecorder logic and final preview.
const ScreenRecorder = forwardRef<ScreenRecorderHandle, {}>((_props, ref) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timer, setTimer] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [showPreview, setShowPreview] = useState(false);

    // =========== MAIN RECORDING LOGIC ===========

    const startRecording = async () => {
        try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });
            streamRef.current = displayStream;

            const mimeType = "video/webm";
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                console.error("MimeType not supported:", mimeType);
                return;
            }
            const mediaRecorder = new MediaRecorder(displayStream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                setRecordedBlob(blob);
                setShowPreview(true); // Show final preview popup
                // Stop all tracks.
                displayStream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);

            // Start timer
            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error starting screen recording:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setTimer(0);
        setIsPaused(false);
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
    };

    const retryRecording = async () => {
        // If still recording, stop first
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setTimer(0);
        setRecordedBlob(null);
        setShowPreview(false);
        await startRecording();
    };

    const closeRecording = () => {
        // If still recording, stop
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setIsPaused(false);
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setTimer(0);
        setRecordedBlob(null);
        setShowPreview(false);
        // Also stop any tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
    };

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        startRecording,
        stopRecording,
        recordedBlob,
        isRecording,
    }));

    // =========== UI RENDERING ===========

    return (
        <>
            {/* Child overlay for webcam + controls (purely presentational) */}
            <ScreenRecorderWithCam
                isRecording={isRecording}
                isPaused={isPaused}
                timer={timer}
                onStop={stopRecording}
                onPause={pauseRecording}
                onResume={resumeRecording}
                onRetry={retryRecording}
                onClose={closeRecording}
            />

            {/* Final Preview Popup */}
            {showPreview && recordedBlob && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
                    <div className="bg-white p-4 rounded-lg w-[500px] flex flex-col gap-3">
                        <h3 className="text-lg font-bold">Recording Preview</h3>
                        <video
                            src={URL.createObjectURL(recordedBlob)}
                            controls
                            autoPlay
                            className="w-full h-auto"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => console.log("Save or do something with the video...")}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

export default ScreenRecorder;
