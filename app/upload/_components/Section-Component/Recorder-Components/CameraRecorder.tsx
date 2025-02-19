// CameraRecorder.tsx
"use client";
import React, {
    useImperativeHandle,
    useRef,
    useState,
    forwardRef,
} from "react";
import Webcam from "react-webcam";
import Draggable from "react-draggable";

export interface CameraRecorderHandle {
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    recordedBlob: Blob | null;
    isRecording: boolean;
}

const CameraRecorder = forwardRef<CameraRecorderHandle, {}>((_props, ref) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [showWebcam, setShowWebcam] = useState(false);
    const [webcamKey, setWebcamKey] = useState(0); // force remount for a fresh stream
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const webcamRef = useRef<Webcam>(null);
    const draggableRef = useRef<HTMLDivElement>(null);

    const startRecording = async () => {
        // On the first click, mount the webcam preview
        if (!showWebcam) {
            setShowWebcam(true);
            return;
        }

        // Grab the current webcam stream.
        const stream = webcamRef.current?.video?.srcObject as MediaStream | undefined;
        if (!stream || stream.getTracks().every((track) => track.readyState === "ended")) {
            console.error("Webcam stream not available or ended, reinitializing...");
            setShowWebcam(false);
            setTimeout(() => {
                setWebcamKey((prev) => prev + 1);
                setShowWebcam(true);
            }, 100);
            return;
        }

        // Use a supported mime type.
        const mimeType = "video/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            console.error("MimeType not supported:", mimeType);
            return;
        }

        try {
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
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
                // Stop all tracks so the stream is completely ended.
                stream.getTracks().forEach((track) => track.stop());
                // Unmount the webcam preview to force a new stream next time.
                setShowWebcam(false);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error starting MediaRecorder:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    useImperativeHandle(ref, () => ({
        startRecording,
        stopRecording,
        recordedBlob,
        isRecording,
    }));

    return (
        showWebcam && (
            <Draggable nodeRef={draggableRef as React.RefObject<HTMLElement>}>
                <div
                    ref={draggableRef}
                    className="fixed bottom-4 right-4 p-2 bg-white border border-gray-300 shadow-lg rounded-lg z-50"
                >
                    <Webcam
                        key={webcamKey}
                        audio={true}
                        ref={webcamRef}
                        videoConstraints={{ facingMode: "user" }} // Use the front camera
                        className="w-[600px] rounded-lg"
                    />
                </div>
            </Draggable>
        )
    );
});

export default CameraRecorder;
