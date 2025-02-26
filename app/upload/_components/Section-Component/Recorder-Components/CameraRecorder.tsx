"use client";
import React, {
    useImperativeHandle,
    useRef,
    useState,
    forwardRef,
    useEffect,
    Fragment,
} from "react";
import Webcam from "react-webcam";
import Draggable from "react-draggable";
import RecorderControls from "./CameraRecorder-Components/RecorderControl";

export interface CameraRecorderHandle {
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    recordedBlob: Blob | null;
    isRecording: boolean;
}

const CameraRecorder = forwardRef<CameraRecorderHandle>((_props, ref) => {
    // Use a combined state for the recording phase.
    // "idle" = not recording, "countdown" = showing countdown, "recording" = actual recording.
    const [recordingPhase, setRecordingPhase] = useState<
        "idle" | "countdown" | "recording"
    >("idle");
    // Countdown value (3,2,1) while in countdown phase.
    const [countdown, setCountdown] = useState<number | null>(null);
    const [recordedMp4, setRecordedMp4] = useState<Blob | null>(null);
    const [showWebcam, setShowWebcam] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [timer, setTimer] = useState(0);
    // Aspect ratio: "portrait" (9:16) or "landscape" (16:9)
    const [aspect, setAspect] = useState<"portrait" | "landscape">("portrait");

    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const webcamRef = useRef<Webcam>(null);
    const draggableRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const stoppingBecauseOfRetryRef = useRef(false);

    // Dimensions for the draggable preview
    const containerWidth = 600;
    const containerHeight = 600;
    const webcamBoxHeight = 450;

    // Calculate cropping bounding box based on aspect
    const boundingWidth =
        aspect === "portrait" ? (9 / 16) * webcamBoxHeight : containerWidth;
    const boundingHeight =
        aspect === "portrait" ? webcamBoxHeight : (9 / 16) * containerWidth;
    const boundingLeft = (containerWidth - boundingWidth) / 2;
    const boundingTop = (webcamBoxHeight - boundingHeight) / 2;

    // Format timer as MM:SS
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    /**
     * Draw webcam frames onto the hidden canvas for capturing in a custom aspect ratio.
     */
    const drawFrame = () => {
        if (!canvasRef.current || !webcamRef.current?.video) {
            animationFrameRef.current = requestAnimationFrame(drawFrame);
            return;
        }
        const video = webcamRef.current.video as HTMLVideoElement;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) {
            animationFrameRef.current = requestAnimationFrame(drawFrame);
            return;
        }
        canvasRef.current.width = boundingWidth;
        canvasRef.current.height = boundingHeight;

        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = boundingWidth / boundingHeight;
        let srcWidth, srcHeight, srcX, srcY;
        if (videoAspect > canvasAspect) {
            srcHeight = video.videoHeight;
            srcWidth = srcHeight * canvasAspect;
            srcX = (video.videoWidth - srcWidth) / 2;
            srcY = 0;
        } else {
            srcWidth = video.videoWidth;
            srcHeight = srcWidth / canvasAspect;
            srcX = 0;
            srcY = (video.videoHeight - srcHeight) / 2;
        }
        ctx.drawImage(
            video,
            srcX,
            srcY,
            srcWidth,
            srcHeight,
            0,
            0,
            boundingWidth,
            boundingHeight
        );
        animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    useEffect(() => {
        if (showWebcam) {
            animationFrameRef.current = requestAnimationFrame(drawFrame);
        } else if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [showWebcam, aspect]);

    /**
     * Open the recorder UI (prepare for recording but do not start yet).
     */
    const openRecorderUI = async () => {
        setShowPreview(false);
        setRecordedMp4(null);
        setTimer(0);
        setRecordingPhase("idle");
        setCountdown(null);
        if (!showWebcam) {
            setShowWebcam(true);
            // Wait until the webcam video is ready
            await new Promise<void>((resolve) => {
                const checkVideoReady = () => {
                    const vid = webcamRef.current?.video;
                    if (vid && vid.readyState >= 1) {
                        resolve();
                    } else {
                        setTimeout(checkVideoReady, 100);
                    }
                };
                checkVideoReady();
            });
        }
    };

    /**
     * Start the MediaRecorder once the countdown is finished.
     */
    const startMediaRecorder = () => {
        const originalStream = webcamRef.current?.video?.srcObject as MediaStream;
        if (!originalStream || !canvasRef.current) {
            console.error("No webcam stream or canvas found.");
            return;
        }

        // Capture the webcam video from the canvas and add audio tracks
        const canvasStream = canvasRef.current.captureStream(30);
        originalStream.getAudioTracks().forEach((track) => {
            canvasStream.addTrack(track);
        });

        const mimeType = MediaRecorder.isTypeSupported("video/mp4; codecs=avc1")
            ? "video/mp4; codecs=avc1"
            : "video/webm; codecs=vp9";

        const mediaRecorder = new MediaRecorder(canvasStream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                recordedChunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            if (stoppingBecauseOfRetryRef.current) {
                stoppingBecauseOfRetryRef.current = false;
                return;
            }
            const mp4Blob = new Blob(recordedChunksRef.current, { type: mimeType });
            setRecordedMp4(mp4Blob);
            // Stop all tracks so the webcam is freed
            originalStream.getTracks().forEach((t) => t.stop());
            setShowWebcam(false);
            setShowPreview(true);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setTimer(0);
        };

        mediaRecorder.onerror = (event) => {
            console.error("MediaRecorder error:", event);
        };

        // Start recording with a timeslice of 1 second
        mediaRecorder.start(1000);
        timerIntervalRef.current = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
    };

    /**
     * Stop recording.
     */
    const stopMediaRecorder = () => {
        if (mediaRecorderRef.current && recordingPhase === "recording") {
            mediaRecorderRef.current.stop();
            setRecordingPhase("idle");
        }
    };

    /**
     * Called by the parent to stop recording.
     */
    const parentStopRecording = () => {
        if (recordingPhase === "recording") {
            stopMediaRecorder();
        } else {
            closeRecording();
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && recordingPhase === "recording") {
            mediaRecorderRef.current.pause();
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && recordingPhase === "recording") {
            mediaRecorderRef.current.resume();
            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
    };

    const retryRecording = async () => {
        if (mediaRecorderRef.current && recordingPhase === "recording") {
            stoppingBecauseOfRetryRef.current = true;
            mediaRecorderRef.current.stop();
            setRecordingPhase("idle");
        }
        setTimer(0);
        setRecordedMp4(null);
        setShowPreview(false);
        startMediaRecorder();
    };

    const closeRecording = () => {
        if (mediaRecorderRef.current && recordingPhase === "recording") {
            mediaRecorderRef.current.stop();
        }
        setRecordingPhase("idle");
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        setTimer(0);
        setRecordedMp4(null);
        setShowPreview(false);
        setShowWebcam(false);
        setCountdown(null);
    };

    const downloadRecording = () => {
        if (recordedMp4) {
            const extension = recordedMp4.type.includes("mp4") ? "mp4" : "webm";
            const url = URL.createObjectURL(recordedMp4);
            const a = document.createElement("a");
            a.href = url;
            a.download = `camera-recording.${extension}`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    /**
     * When the record button is clicked in idle mode, start a static countdown.
     * It displays 3, then 2, then 1 (each for 1 second) before starting the recording.
     */
    const handleRecordButtonClick = () => {
        if (recordingPhase === "idle") {
            setRecordingPhase("countdown");
            setCountdown(3);
            let count = 3;
            const interval = setInterval(() => {
                count--;
                if (count > 0) {
                    setCountdown(count);
                } else {
                    clearInterval(interval);
                    setCountdown(null);
                    setRecordingPhase("recording");
                    startMediaRecorder();
                }
            }, 1000);
        } else if (recordingPhase === "recording") {
            stopMediaRecorder();
        }
    };

    useImperativeHandle(ref, () => ({
        startRecording: openRecorderUI,
        stopRecording: parentStopRecording,
        recordedBlob: recordedMp4,
        isRecording: recordingPhase === "recording",
    }));

    if (!showWebcam && !showPreview) return null;

    // Overlay styles for cropping mask
    const topOverlayStyle = { top: 0, left: 0, width: "100%", height: boundingTop };
    const bottomOverlayStyle = {
        top: boundingTop + boundingHeight,
        left: 0,
        width: "100%",
        height: webcamBoxHeight - (boundingTop + boundingHeight),
    };
    const leftOverlayStyle = {
        top: boundingTop,
        left: 0,
        width: boundingLeft,
        height: boundingHeight,
    };
    const rightOverlayStyle = {
        top: boundingTop,
        left: boundingLeft + boundingWidth,
        width: containerWidth - (boundingLeft + boundingWidth),
        height: boundingHeight,
    };

    return (
        <Draggable nodeRef={draggableRef as React.RefObject<HTMLElement>}>
            <div
                ref={draggableRef}
                className="fixed bottom-16 right-16 flex flex-col gap-4 bg-transparent z-[9999]"
                style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}
            >
                {/* --- Top Panel --- */}
                <div>
                    <div className="rounded-t-lg bg-black px-3 py-2">
                        <span className="font-semibold text-white">Recorder Preview</span>
                    </div>
                    <div className="relative w-full h-[450px] rounded-b-lg overflow-hidden bg-black">
                        {showWebcam && !showPreview && (
                            <Fragment>
                                <Webcam
                                    audio={true}
                                    muted={true}
                                    ref={webcamRef}
                                    className="absolute top-0 left-0 w-full h-full object-cover"
                                    videoConstraints={{ facingMode: "user" }}
                                />
                                <div
                                    className="absolute border-2 border-dashed border-white pointer-events-none"
                                    style={{
                                        top: boundingTop,
                                        left: boundingLeft,
                                        width: boundingWidth,
                                        height: boundingHeight,
                                    }}
                                />
                                <div className="absolute bg-black/50" style={topOverlayStyle} />
                                <div className="absolute bg-black/50" style={bottomOverlayStyle} />
                                <div className="absolute bg-black/50" style={leftOverlayStyle} />
                                <div className="absolute bg-black/50" style={rightOverlayStyle} />
                            </Fragment>
                        )}
                        {showPreview && recordedMp4 && (
                            <Fragment>
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 gap-4">
                                    <h4 className="text-white text-sm">MP4 Preview</h4>
                                    <video
                                        controls
                                        autoPlay
                                        className="border border-white"
                                        style={{
                                            width: boundingWidth,
                                            height: boundingHeight,
                                            objectFit: "cover",
                                        }}
                                        src={URL.createObjectURL(recordedMp4)}
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={downloadRecording}
                                            className="px-4 py-2 bg-blue-500 text-white rounded text-sm transition hover:opacity-80"
                                        >
                                            Download
                                        </button>
                                        <button
                                            onClick={closeRecording}
                                            className="px-4 py-2 bg-gray-400 text-white rounded text-sm transition hover:opacity-80"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </Fragment>
                        )}
                    </div>
                </div>

                {/* --- Bottom Control Bar (Child) --- */}
                {showWebcam && !showPreview && (
                    <RecorderControls
                        isRecording={recordingPhase === "recording"}
                        countdown={countdown}
                        timer={timer}
                        aspect={aspect}
                        formatTime={formatTime}
                        onRetry={retryRecording}
                        onRecordButtonClick={handleRecordButtonClick}
                        onPause={pauseRecording}
                        onResume={resumeRecording}
                        onChangeAspect={(val) => setAspect(val)}
                        onClose={closeRecording}
                    />
                )}

                {/* Hidden canvas for capturing frames */}
                <canvas
                    ref={canvasRef}
                    width={boundingWidth}
                    height={boundingHeight}
                    className="hidden"
                />
            </div>
        </Draggable>
    );
});

export default CameraRecorder;
