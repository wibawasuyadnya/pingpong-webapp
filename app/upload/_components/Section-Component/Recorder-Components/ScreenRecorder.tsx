"use client";
import React, {
    useImperativeHandle,
    useRef,
    useState,
    forwardRef,
    Fragment,
} from "react";
import ScreenRecorderWithCam from "./ScreenRecorder-Components/ScreenRecorderWithCam";
import FakeScreenPrompt from "./ScreenRecorder-Components/FakeScreenPrompt";

export interface ScreenRecorderHandle {
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    recordedBlob: Blob | null;
    isRecording: boolean;
}

export interface CameraRecorderProps {
    onRecordingStatusChange?: (isRecording: boolean) => void;
}

type DisplaySurfaceOption = "monitor" | "window" | "browser";

const ScreenRecorder = forwardRef<ScreenRecorderHandle, CameraRecorderProps>(({ onRecordingStatusChange }, ref) => {
    // Recording phase can be "idle", "countdown", or "recording"
    const [recordingPhase, setRecordingPhase] = useState<"idle" | "countdown" | "recording">("idle");
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [timer, setTimer] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    // showUI now controls the camera overlay; it’s only shown after the native prompt and during recording.
    const [showUI, setShowUI] = useState(false);
    const [showScreenPrompt, setShowScreenPrompt] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

    // Returns the display stream using the chosen mode.
    const getDisplayStream = async (mode: DisplaySurfaceOption) => {
        return await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: mode },
            audio: false,
        });
    };

    // Once the display stream is acquired and the countdown is over,
    // this function captures the microphone, sets up the recorder, and starts recording.
    const startRecordingProcess = async () => {
        setShowUI(true); // show the draggable camera overlay
        try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = micStream;

            const preferredMimeType = "video/mp4; codecs=avc1";
            const fallbackMimeType = "video/webm; codecs=vp9";
            const mimeType = MediaRecorder.isTypeSupported(preferredMimeType)
                ? preferredMimeType
                : MediaRecorder.isTypeSupported(fallbackMimeType)
                    ? fallbackMimeType
                    : "video/webm";

            // Create an AudioContext to mix mic audio with screen video.
            audioContextRef.current = new AudioContext();
            destinationRef.current = audioContextRef.current.createMediaStreamDestination();
            const micSource = audioContextRef.current.createMediaStreamSource(micStream);
            micSource.connect(destinationRef.current);

            // Combine the display stream (already in streamRef) with the audio track.
            const combinedStream = new MediaStream([
                ...streamRef.current!.getVideoTracks(),
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
                setRecordingPhase("idle");
                setShowUI(false);
                cleanupStreams();
            };

            mediaRecorder.onerror = (event) => {
                console.error("MediaRecorder error:", event);
            };

            // Stop the recording if any track ends unexpectedly.
            combinedStream.getTracks().forEach((track) => {
                track.onended = () => {
                    if (mediaRecorderRef.current?.state === "recording") {
                        mediaRecorderRef.current.stop();
                    }
                };
            });

            mediaRecorder.start(1000);
            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error during recording process:", error);
            cleanupStreams();
            setRecordingPhase("idle");
            setShowUI(false);
        }
    };

    // When the FakeScreenPrompt confirms a mode, first call the native prompt,
    // then start a countdown, and finally begin recording.
    const handleScreenPromptConfirm = async (_dummyImage: string, mode: DisplaySurfaceOption) => {
        setShowScreenPrompt(false);
        try {
            const displayStream = await getDisplayStream(mode);
            // native prompt completed here
            streamRef.current = displayStream; 
            setRecordingPhase("countdown");
            let count = 3;
            setCountdown(count);
            const interval = setInterval(() => {
                count--;
                if (count > 0) {
                    setCountdown(count);
                } else {
                    clearInterval(interval);
                    setCountdown(null);
                    setRecordingPhase("recording");
                    void startRecordingProcess();
                }
            }, 1000);
        } catch (error: any) {
            onRecordingStatusChange?.(false);
            if (error.name !== "NotAllowedError") {
                console.error("Error with native prompt:", error);
            }
            setRecordingPhase("idle");
            setShowUI(false);
        }
    };



    // Clicking the record button when idle opens the fake prompt.
    // When already recording, it stops the recording.
    const initiateRecording = async () => {
        if (recordingPhase === "idle") {
            setShowScreenPrompt(true);
        } else if (recordingPhase === "recording") {
            stopRecording();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recordingPhase === "recording") {
            mediaRecorderRef.current.stop();
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            setTimer(0);
            setIsPaused(false);
        }
    };

    const onPause = () => {
        if (mediaRecorderRef.current && recordingPhase === "recording") {
            mediaRecorderRef.current.pause();
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setIsPaused(true);
        }
    };

    const onResume = () => {
        if (mediaRecorderRef.current && recordingPhase === "recording") {
            mediaRecorderRef.current.resume();
            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
            setIsPaused(false);
        }
    };

    const onClose = () => {
        if (mediaRecorderRef.current && recordingPhase === "recording") {
            mediaRecorderRef.current.stop();
        }
        setRecordingPhase("idle");
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setTimer(0);
        setRecordedBlob(null);
        setPreviewUrl(null);
        setShowUI(false);
        setCountdown(null);
        setIsPaused(false);
        setShowScreenPrompt(false);
        onRecordingStatusChange?.(false);
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
        startRecording: initiateRecording,
        stopRecording,
        recordedBlob,
        isRecording: recordingPhase === "recording",
    }));

    return (
        <Fragment>
            <ScreenRecorderWithCam
                isRecording={recordingPhase === "recording"}
                isPaused={isPaused}
                timer={timer}
                countdown={countdown}
                onRecordButtonClick={initiateRecording}
                onStop={stopRecording}
                onPause={onPause}
                onResume={onResume}
                onClose={onClose}
                showUI={showUI || recordingPhase === "countdown"}
            />
            {showScreenPrompt && (
                <FakeScreenPrompt
                    onClose={() => setShowScreenPrompt(false)}
                    onConfirm={handleScreenPromptConfirm}
                />
            )}
            {previewUrl && recordedBlob && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
                    <div className="bg-white p-4 rounded-lg w-[500px] flex flex-col gap-3">
                        <h3 className="text-lg font-bold">Recording Preview</h3>
                        <video src={previewUrl} controls autoPlay className="w-full h-auto" />
                        <div className="flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    if (recordedBlob) {
                                        const extension = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
                                        const a = document.createElement("a");
                                        a.href = previewUrl;
                                        a.download = `screen-recording.${extension}`;
                                        a.click();
                                    }
                                }}
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
