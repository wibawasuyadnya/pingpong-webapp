"use client";
import React, {
    useImperativeHandle,
    useRef,
    useState,
    forwardRef,
    Fragment,
} from "react";
import { useRouter } from "next/navigation";
import ScreenRecorderWithCam from "./ScreenRecorder-Components/ScreenRecorderWithCam";
import FakeScreenPrompt from "./ScreenRecorder-Components/FakeScreenPrompt";
import { useAppDispatch } from "@/redux/hook";
import { setVideo } from "@/redux/slices/videoSlice";

export interface ScreenRecorderHandle {
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    recordedBlob: Blob | null;
    isRecording: boolean;
}

export interface CameraRecorderProps {
    onRecordingStatusChange?: (isRecording: boolean) => void;
    replyVideo: string | undefined;
}

type DisplaySurfaceOption = "monitor" | "window" | "browser";

/** Converts a Blob to a base64 data URL (e.g. "data:video/mp4;base64,AAA..."). */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

const ScreenRecorder = forwardRef<ScreenRecorderHandle, CameraRecorderProps>(
    ({ onRecordingStatusChange, replyVideo }, ref) => {
        const router = useRouter();
        const dispatch = useAppDispatch();

        // Recording states
        const [recordingPhase, setRecordingPhase] = useState<"idle" | "countdown" | "recording">("idle");
        const [countdown, setCountdown] = useState<number | null>(null);
        const [isPaused, setIsPaused] = useState(false);
        const [timer, setTimer] = useState(0);
        const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

        // UI states
        const [showUI, setShowUI] = useState(false);
        const [showScreenPrompt, setShowScreenPrompt] = useState(false);

        // Refs for MediaRecorder, streams, etc.
        const mediaRecorderRef = useRef<MediaRecorder | null>(null);
        const recordedChunksRef = useRef<Blob[]>([]);
        const streamRef = useRef<MediaStream | null>(null);
        const micStreamRef = useRef<MediaStream | null>(null);
        const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
        const audioContextRef = useRef<AudioContext | null>(null);
        const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

        /** Request a screen/window/tab stream with the chosen displaySurface mode. */
        const getDisplayStream = async (mode: DisplaySurfaceOption) => {
            return navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: mode },
                audio: false,
            });
        };

        /** Start the actual recording after user picks a display surface. */
        const startRecordingProcess = async () => {
            setShowUI(true);
            try {
                // 1) Request microphone audio
                const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                micStreamRef.current = micStream;

                // 2) Pick a MIME type
                const preferredMimeType = "video/mp4; codecs=avc1";
                const fallbackMimeType = "video/webm; codecs=vp9";
                const mimeType = MediaRecorder.isTypeSupported(preferredMimeType)
                    ? preferredMimeType
                    : MediaRecorder.isTypeSupported(fallbackMimeType)
                        ? fallbackMimeType
                        : "video/webm";

                // 3) Merge mic + screen
                audioContextRef.current = new AudioContext();
                destinationRef.current = audioContextRef.current.createMediaStreamDestination();
                const micSource = audioContextRef.current.createMediaStreamSource(micStream);
                micSource.connect(destinationRef.current);

                const combinedStream = new MediaStream([
                    ...streamRef.current!.getVideoTracks(),
                    ...destinationRef.current.stream.getAudioTracks(),
                ]);

                // 4) Setup the MediaRecorder
                const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });
                mediaRecorderRef.current = mediaRecorder;
                recordedChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                // 5) onstop: build the final Blob, parse ephemeral ID, navigate
                mediaRecorder.onstop = async () => {
                    const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                    setRecordedBlob(blob);

                    // Cleanup local
                    setRecordingPhase("idle");
                    setShowUI(false);
                    cleanupStreams();

                    // Convert to base64 and store in Redux
                    const base64Video = await blobToBase64(blob);
                    dispatch(
                        setVideo({
                            base64Data: base64Video,
                            size: blob.size,
                            type: blob.type,
                        })
                    );

                    // Create a preview URL
                    const previewUrl = URL.createObjectURL(blob);

                    // Parse ephemeral ID from the blob URL
                    let ephemeralId = "";
                    const slashIndex = previewUrl.lastIndexOf("/");
                    if (slashIndex !== -1) {
                        ephemeralId = previewUrl.substring(slashIndex + 1);
                    }

                    // Navigate to /upload/[ephemeralId].mp4?post=new
                    router.push(`/upload/${ephemeralId}.mp4?post=${replyVideo !== undefined ? replyVideo : "new"}`);
                };

                mediaRecorder.onerror = (event) => {
                    console.error("MediaRecorder error:", event);
                };

                // If any track ends unexpectedly, stop the recorder
                combinedStream.getTracks().forEach((track) => {
                    track.onended = () => {
                        if (mediaRecorderRef.current?.state === "recording") {
                            mediaRecorderRef.current.stop();
                        }
                    };
                });

                // 6) Start recording
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

        /** Called after user picks "monitor/window/browser" in FakeScreenPrompt. */
        const handleScreenPromptConfirm = async (_dummyImage: string, mode: DisplaySurfaceOption) => {
            setShowScreenPrompt(false);
            try {
                const displayStream = await getDisplayStream(mode);
                streamRef.current = displayStream;

                // 3-second countdown
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

        /** Start or stop recording via the main record button. */
        const initiateRecording = async () => {
            if (recordingPhase === "idle") {
                setShowScreenPrompt(true);
            } else if (recordingPhase === "recording") {
                stopRecording();
            }
        };

        /** Stop the recorder. */
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

        /** Pause the recording. */
        const onPause = () => {
            if (mediaRecorderRef.current && recordingPhase === "recording") {
                mediaRecorderRef.current.pause();
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                setIsPaused(true);
            }
        };

        /** Resume the recording. */
        const onResume = () => {
            if (mediaRecorderRef.current && recordingPhase === "recording") {
                mediaRecorderRef.current.resume();
                timerIntervalRef.current = setInterval(() => {
                    setTimer((prev) => prev + 1);
                }, 1000);
                setIsPaused(false);
            }
        };

        /** Closes the recorder UI if user hits the "X" button. */
        const onClose = () => {
            if (mediaRecorderRef.current && recordingPhase === "recording") {
                mediaRecorderRef.current.stop();
            }
            setRecordingPhase("idle");
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setTimer(0);
            setRecordedBlob(null);
            setShowUI(false);
            setCountdown(null);
            setIsPaused(false);
            setShowScreenPrompt(false);
            onRecordingStatusChange?.(false);
        };

        /** Cleanup streams + audio context. */
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
            </Fragment>
        );
    }
);

export default ScreenRecorder;
