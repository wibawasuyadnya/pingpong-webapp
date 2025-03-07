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
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hook";
import { setVideo } from "@/redux/slices/videoSlice";

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

export interface CameraRecorderHandle {
    stopRecording: () => void;
    isRecording: boolean;
    startRecording: () => Promise<void>;
    recordedBlob: Blob | null;
}

export interface CameraRecorderProps {
    onRecordingStatusChange?: (isRecording: boolean) => void;
    replyVideo: string | undefined;
}

const CameraRecorder = forwardRef<CameraRecorderHandle, CameraRecorderProps>(
    ({ onRecordingStatusChange, replyVideo }, ref) => {
        const router = useRouter();
        const dispatch = useAppDispatch();

        const [recordingPhase, setRecordingPhase] = useState<"idle" | "countdown" | "recording">("idle");
        const [countdown, setCountdown] = useState<number | null>(null);
        const [recordedMp4, setRecordedMp4] = useState<Blob | null>(null);
        const [showWebcam, setShowWebcam] = useState(false);
        const [showPreview, setShowPreview] = useState(false);
        const [timer, setTimer] = useState(0);
        const [aspect, setAspect] = useState<"portrait" | "landscape">("portrait");
        const [isPaused, setIsPaused] = useState(false);

        const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
        const mediaRecorderRef = useRef<MediaRecorder | null>(null);
        const recordedChunksRef = useRef<Blob[]>([]);
        const webcamRef = useRef<Webcam>(null);
        const draggableRef = useRef<HTMLDivElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const animationFrameRef = useRef<number | null>(null);
        const stoppingBecauseOfRetryRef = useRef(false);

        const containerWidth = 600;
        const containerHeight = 600;
        const webcamBoxHeight = 450;

        const boundingWidth =
            aspect === "portrait" ? (9 / 16) * webcamBoxHeight : containerWidth;
        const boundingHeight =
            aspect === "portrait" ? webcamBoxHeight : (9 / 16) * containerWidth;
        const boundingLeft = (containerWidth - boundingWidth) / 2;
        const boundingTop = (webcamBoxHeight - boundingHeight) / 2;

        const formatTime = (sec: number) => {
            const m = Math.floor(sec / 60).toString().padStart(2, "0");
            const s = (sec % 60).toString().padStart(2, "0");
            return `${m}:${s}`;
        };

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
            ctx.drawImage(video, srcX, srcY, srcWidth, srcHeight, 0, 0, boundingWidth, boundingHeight);
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

        const openRecorderUI = async () => {
            setShowPreview(false);
            setRecordedMp4(null);
            setTimer(0);
            setRecordingPhase("idle");
            setCountdown(null);
            setIsPaused(false);
            if (!showWebcam) {
                setShowWebcam(true);
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

        const startMediaRecorder = () => {
            const originalStream = webcamRef.current?.video?.srcObject as MediaStream;
            if (!originalStream || !canvasRef.current) {
                console.error("No webcam stream or canvas found.");
                return;
            }
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

            mediaRecorder.onstop = async () => {
                if (stoppingBecauseOfRetryRef.current) {
                    stoppingBecauseOfRetryRef.current = false;
                    return;
                }
                const mp4Blob = new Blob(recordedChunksRef.current, { type: mimeType });
                setRecordedMp4(mp4Blob);
                originalStream.getTracks().forEach((t) => t.stop());
                setShowWebcam(false);
                setShowPreview(true);
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                setTimer(0);

                // 1) Convert blob to base64
                const base64Video = await blobToBase64(mp4Blob);
                // 2) Dispatch to Redux
                dispatch(
                    setVideo({
                        base64Data: base64Video,
                        size: mp4Blob.size,
                        type: mp4Blob.type,
                    })
                );

                // 3) Generate a random ID for the route push
                const randomId = crypto.randomUUID();
                const videoFilename = `${randomId}.mp4`;

                // 4) Navigate to /upload/[videoFilename]?post=new
                // This is where your dynamic route picks it up
                router.push(`/upload/${videoFilename}?post=${replyVideo !== undefined ? replyVideo : "new"}`);
            };

            mediaRecorder.onerror = (event) => {
                console.error("MediaRecorder error:", event);
            };

            mediaRecorder.start(1000);
            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        };

        const stopMediaRecorder = () => {
            if (mediaRecorderRef.current && recordingPhase === "recording") {
                mediaRecorderRef.current.stop();
                setRecordingPhase("idle");
                setIsPaused(false);
            }
        };

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
                setIsPaused(true);
            }
        };

        const resumeRecording = () => {
            if (mediaRecorderRef.current && recordingPhase === "recording") {
                mediaRecorderRef.current.resume();
                timerIntervalRef.current = setInterval(() => {
                    setTimer((prev) => prev + 1);
                }, 1000);
                setIsPaused(false);
            }
        };

        const retryRecording = async () => {
            if (mediaRecorderRef.current && recordingPhase === "recording") {
                stoppingBecauseOfRetryRef.current = true;
                mediaRecorderRef.current.stop();
            }

            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }

            setTimer(0);
            setRecordedMp4(null);
            setShowPreview(false);
            setRecordingPhase("idle");
            setCountdown(null);
            setIsPaused(false);
        };

        const closeRecording = () => {
            if (mediaRecorderRef.current && recordingPhase === "recording") {
                mediaRecorderRef.current.stop();
            }
            setRecordingPhase("idle");
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setTimer(0);
            setRecordedMp4(null);
            setShowPreview(false);
            setShowWebcam(false);
            setCountdown(null);
            setIsPaused(false);
            onRecordingStatusChange?.(false);
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
                    {/* Top Panel */}
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
                        </div>
                    </div>

                    {/* Bottom Control Bar */}
                    {showWebcam && !showPreview && (
                        <RecorderControls
                            isRecording={recordingPhase === "recording"}
                            isPaused={isPaused}
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

                    {/* Hidden canvas */}
                    <canvas
                        ref={canvasRef}
                        width={boundingWidth}
                        height={boundingHeight}
                        className="hidden"
                    />
                </div>
            </Draggable>
        );
    }
);

export default CameraRecorder;
