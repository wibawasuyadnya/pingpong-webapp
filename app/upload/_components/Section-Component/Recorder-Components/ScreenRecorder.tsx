"use client";
import React, { useImperativeHandle, useRef, useState, forwardRef, Fragment } from "react";
import ScreenRecorderWithCam from "./ScreenRecorder-Components/ScreenRecorderWithCam";

export interface ScreenRecorderHandle {
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    recordedBlob: Blob | null;
    isRecording: boolean;
}

const ScreenRecorder = forwardRef<ScreenRecorderHandle, {}>((_props, ref) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timer, setTimer] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

    const startRecording = async () => {
        try {
            // Capture screen video (and optionally system audio)
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false, // Set to false to exclude system audio; we'll add mic audio separately
            });
            streamRef.current = displayStream;

            // Capture microphone audio
            const micStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            micStreamRef.current = micStream;

            // Prefer MP4 with H.264 codec, fallback to WebM
            const preferredMimeType = "video/mp4; codecs=avc1";
            const fallbackMimeType = "video/webm; codecs=vp9";
            const mimeType = MediaRecorder.isTypeSupported(preferredMimeType)
                ? preferredMimeType
                : MediaRecorder.isTypeSupported(fallbackMimeType)
                    ? fallbackMimeType
                    : "video/webm";

            // Mix screen video with microphone audio
            audioContextRef.current = new AudioContext();
            destinationRef.current = audioContextRef.current.createMediaStreamDestination();

            const micSource = audioContextRef.current.createMediaStreamSource(micStream);
            micSource.connect(destinationRef.current);

            // Combine screen video with microphone audio
            const combinedStream = new MediaStream([
                ...displayStream.getVideoTracks(),
                ...destinationRef.current.stream.getAudioTracks(),
            ]);

            const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                setRecordedBlob(blob);
                setPreviewUrl(url);
                setIsRecording(false);
                cleanupStreams();
            };

            mediaRecorder.onerror = (event) => {
                console.error("MediaRecorder error:", event);
            };

            // Log track endings for debugging
            combinedStream.getTracks().forEach((track) => {
                track.onended = () => {
                    console.log(`${track.kind} track ended.`);
                    if (mediaRecorderRef.current?.state === "recording") {
                        mediaRecorderRef.current.stop();
                    }
                };
            });

            mediaRecorder.start(1000); // Timeslice for periodic dataavailable events
            setIsRecording(true);
            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error starting recording:", error);
            setIsRecording(false);
            cleanupStreams();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            setTimer(0);
            setIsPaused(false);
        }
    };

    const downloadRecording = () => {
        if (recordedBlob && previewUrl) {
            const extension = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
            const a = document.createElement("a");
            a.href = previewUrl;
            a.download = `screen-recording.${extension}`;
            a.click();
        }
    };

    const closePreview = () => {
        setPreviewUrl(null);
        setRecordedBlob(null);
        cleanupStreams();
    };

    const cleanupStreams = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach((track) => track.stop());
            micStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
            destinationRef.current = null;
        }
    };

    useImperativeHandle(ref, () => ({
        startRecording,
        stopRecording,
        recordedBlob,
        isRecording,
    }));

    return (
        <Fragment>
            <ScreenRecorderWithCam
                isRecording={isRecording}
                isPaused={isPaused}
                timer={timer}
                onStop={stopRecording}
                onPause={() => mediaRecorderRef.current?.pause() && setIsPaused(true)}
                onResume={() => mediaRecorderRef.current?.resume() && setIsPaused(false)}
                onRetry={async () => {
                    stopRecording();
                    await startRecording();
                }}
                onClose={closePreview}
            />

            {previewUrl && recordedBlob && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
                    <div className="bg-white p-4 rounded-lg w-[500px] flex flex-col gap-3">
                        <h3 className="text-lg font-bold">Recording Preview</h3>
                        <video
                            src={previewUrl}
                            controls
                            autoPlay
                            className="w-full h-auto"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closePreview}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Close
                            </button>
                            <button
                                onClick={downloadRecording}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
});

export default ScreenRecorder;