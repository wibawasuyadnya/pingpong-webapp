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
import {
    RotateCcw,
    Pause,
    Play,
    RectangleVertical,
    RectangleHorizontal,
    X,
} from "lucide-react";

export interface CameraRecorderHandle {
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    recordedBlob: Blob | null;
    isRecording: boolean;
}

const CameraRecorder = forwardRef<CameraRecorderHandle, {}>((_props, ref) => {
    // Recording states
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordedMp4, setRecordedMp4] = useState<Blob | null>(null);
    const [showWebcam, setShowWebcam] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [webcamKey, setWebcamKey] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [aspect, setAspect] = useState<"portrait" | "landscape">("portrait");

    // Refs
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const webcamRef = useRef<Webcam>(null);
    const draggableRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const stoppingBecauseOfRetryRef = useRef(false);

    // Container and bounding box dimensions
    const containerWidth = 600;
    const containerHeight = 600;
    const webcamBoxHeight = 450;

    const boundingWidth =
        aspect === "portrait" ? (9 / 16) * webcamBoxHeight : containerWidth;
    const boundingHeight =
        aspect === "portrait" ? webcamBoxHeight : (9 / 16) * containerWidth;

    const boundingLeft = (containerWidth - boundingWidth) / 2;
    const boundingTop = (webcamBoxHeight - boundingHeight) / 2;

    // Format timer
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // Draw webcam feed to canvas within bounding box
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

        // Set canvas dimensions to match bounding box exactly
        canvasRef.current.width = boundingWidth;
        canvasRef.current.height = boundingHeight;

        // Preserve video aspect ratio, cropping instead of stretching
        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = boundingWidth / boundingHeight;

        let srcWidth, srcHeight, srcX, srcY;
        if (videoAspect > canvasAspect) {
            // Video is wider: fit height, crop width
            srcHeight = video.videoHeight;
            srcWidth = srcHeight * canvasAspect;
            srcX = (video.videoWidth - srcWidth) / 2;
            srcY = 0;
        } else {
            // Video is taller: fit width, crop height
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

    const startRecording = async () => {
        setShowPreview(false);
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

        mediaRecorder.onstop = () => {
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
        };

        mediaRecorder.start(1000); // Timeslice for periodic data
        setIsRecording(true);
        setIsPaused(false);

        timerIntervalRef.current = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
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
        if (mediaRecorderRef.current && isRecording) {
            stoppingBecauseOfRetryRef.current = true;
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
        setTimer(0);
        setRecordedMp4(null);
        setShowPreview(false);
        await startRecording();
    };

    const closeRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setIsPaused(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setTimer(0);
        setRecordedMp4(null);
        setShowPreview(false);
        setShowWebcam(false);
    };

    const downloadRecording = () => {
        if (recordedMp4) {
            const extension = recordedMp4.type.includes("mp4") ? "mp4" : "webm";
            const url = URL.createObjectURL(recordedMp4);
            const a = document.createElement("a");
            a.href = url;
            a.download = `camera-recording.${extension}`;
            a.click();
            URL.revokeObjectURL(url); // Clean up
        }
    };

    useImperativeHandle(ref, () => ({
        startRecording,
        stopRecording,
        recordedBlob: recordedMp4,
        isRecording,
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
        <Draggable
            nodeRef={draggableRef as React.RefObject<HTMLElement>}
            onStart={() => setIsDragging(true)}
            onStop={() => setIsDragging(false)}
        >
            <div
                ref={draggableRef}
                className={`fixed bottom-16 right-16 flex flex-col gap-4 bg-transparent z-[9999] ${isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}
            >
                <div>
                    <div className="rounded-t-lg bg-black px-3 py-2">
                        <span className="font-semibold text-white">Recorder Preview</span>
                    </div>
                    <div className="relative w-full h-[450px] rounded-b-lg overflow-hidden bg-black">
                        {showWebcam && !showPreview && (
                            <Fragment>
                                <Webcam
                                    key={webcamKey}
                                    audio={true}
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

                {showWebcam && !showPreview && (
                    <div className="w-full flex flex-row justify-center items-center">
                        <div className="flex items-center justify-center gap-5 bg-black rounded-full px-10 py-2 w-fit">
                            <RotateCcw
                                onClick={retryRecording}
                                className="text-white size-6 cursor-pointer"
                            />
                            <div className="text-white px-2 py-1 rounded text-base font-bold">
                                {formatTime(timer)}
                            </div>
                            {isRecording && (
                                <button
                                    onClick={stopRecording}
                                    className="bg-red-500 text-white border-[3px] border-white w-10 h-10 rounded-full transition hover:opacity-80"
                                />
                            )}
                            {isRecording && !isPaused && (
                                <div className="rounded-full border-white border-[3px] p-2 cursor-pointer">
                                    <Pause onClick={pauseRecording} className="text-white size-5" />
                                </div>
                            )}
                            {isRecording && isPaused && (
                                <div className="rounded-full border-white border-[3px] p-2 cursor-pointer">
                                    <Play onClick={resumeRecording} className="text-white size-5" />
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setAspect("portrait")}
                                    className={`flex flex-row gap-2 justify-center items-center px-3 py-3 text-white rounded-full text-sm transition hover:opacity-80 ${aspect === "portrait" ? "bg-purple-600" : "bg-transparent"
                                        }`}
                                >
                                    <RectangleVertical />
                                    9:16
                                </button>
                                <button
                                    onClick={() => setAspect("landscape")}
                                    className={`flex flex-row gap-2 justify-center items-center px-3 py-3 text-white rounded-full text-sm transition hover:opacity-80 ${aspect === "landscape" ? "bg-purple-600" : "bg-transparent"
                                        }`}
                                >
                                    <RectangleHorizontal />
                                    16:9
                                </button>
                            </div>
                            <X onClick={closeRecording} className="text-white size-6 cursor-pointer" />
                        </div>
                    </div>
                )}

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