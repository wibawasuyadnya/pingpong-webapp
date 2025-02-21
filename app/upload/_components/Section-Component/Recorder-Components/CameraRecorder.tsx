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
import { RotateCcw, Pause, Play, RectangleVertical, RectangleHorizontal, X } from "lucide-react";
import { convertWebMToMP4 } from "@/utils/convertWebMtoMP4";

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

    // The final recorded WebM
    const [recordedWebm, setRecordedWebm] = useState<Blob | null>(null);
    // The converted MP4
    const [convertedMp4, setConvertedMp4] = useState<Blob | null>(null);

    // Show/hide webcam & final preview
    const [showWebcam, setShowWebcam] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Force re-mount for fresh stream
    const [webcamKey, setWebcamKey] = useState(0);

    // Timer
    const [timer, setTimer] = useState(0);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Aspect ratio: "portrait" => 9:16, "landscape" => 16:9
    const [aspect, setAspect] = useState<"portrait" | "landscape">("portrait");

    // Draggable state for changing the cursor
    const [isDragging, setIsDragging] = useState(false);

    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const webcamRef = useRef<Webcam>(null);

    const draggableRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    // A ref to track whether we're stopping because of a retry
    const stoppingBecauseOfRetryRef = useRef(false);

    // Container sizes
    const containerWidth = 600;
    const containerHeight = 600;
    const webcamBoxHeight = 450;

    // bounding box logic
    const boundingWidth =
        aspect === "portrait" ? (9 / 16) * webcamBoxHeight : containerWidth;
    const boundingHeight =
        aspect === "portrait" ? webcamBoxHeight : (9 / 16) * containerWidth;

    const boundingLeft = (containerWidth - boundingWidth) / 2;
    const boundingTop = (webcamBoxHeight - boundingHeight) / 2;

    // Format mm:ss
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // Continuously draw bounding box region from webcam to canvas
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

        ctx.clearRect(0, 0, boundingWidth, boundingHeight);
        ctx.drawImage(
            video,
            boundingLeft,
            boundingTop,
            boundingWidth,
            boundingHeight,
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
    }, [showWebcam, boundingWidth, boundingHeight, boundingLeft, boundingTop]);

    // Start Recording
    const startRecording = async () => {
        setShowPreview(false);

        // If webcam not shown, show it & wait for metadata
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
        if (!originalStream) {
            console.error("No webcam stream found.");
            return;
        }

        if (!canvasRef.current) return;
        const canvasStream = canvasRef.current.captureStream(30);

        // Add audio
        originalStream.getAudioTracks().forEach((track) => {
            canvasStream.addTrack(track);
        });

        // **Always** record in WebM for reliability
        let mimeType = "video/webm; codecs=vp9";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            console.warn("VP9 not supported; falling back to VP8");
            mimeType = "video/webm; codecs=vp8";
        }

        try {
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

                // Finalize the WebM
                const webmBlob = new Blob(recordedChunksRef.current, { type: mimeType });
                setRecordedWebm(webmBlob);

                // Stop original stream
                originalStream.getTracks().forEach((t) => t.stop());

                // Convert WebM -> MP4 client-side
                try {
                    const mp4Blob = await convertWebMToMP4(webmBlob);
                    setConvertedMp4(mp4Blob);
                } catch (err) {
                    console.error("Error converting to MP4:", err);
                }

                setShowWebcam(false);
                setShowPreview(true);

                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                setTimer(0);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);

            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error starting MediaRecorder:", error);
        }
    };

    // Stop
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
    };

    // Pause
    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
    };

    // Resume
    const resumeRecording = () => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
    };

    // Retry
    const retryRecording = async () => {
        if (mediaRecorderRef.current && isRecording) {
            stoppingBecauseOfRetryRef.current = true;
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
        setTimer(0);
        setRecordedWebm(null);
        setConvertedMp4(null);
        setShowPreview(false);
        await startRecording();
    };

    // Close
    const closeRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            try {
                mediaRecorderRef.current.stop();
            } catch (err) {
                console.error("Error closing recording:", err);
            }
        }
        setIsRecording(false);
        setIsPaused(false);

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setTimer(0);

        setRecordedWebm(null);
        setConvertedMp4(null);
        setShowPreview(false);
        setShowWebcam(false);
    };

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        startRecording,
        stopRecording,
        recordedBlob: convertedMp4, // or recordedWebm, your choice
        isRecording,
    }));

    // If neither webcam nor preview is shown, render nothing
    if (!showWebcam && !showPreview) return null;

    // Overlays for bounding box
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
                {/* Title + Webcam/Preview */}
                <div>
                    <div className="rounded-t-lg bg-black px-3 py-2">
                        <span className="font-semibold text-white">Recorder Preview</span>
                    </div>
                    {/* Webcam or Preview Container */}
                    <div className="relative w-full h-[450px] rounded-b-lg overflow-hidden bg-black">
                        {/* If showWebcam, show the live feed & bounding box overlays */}
                        {showWebcam && !showPreview && (
                            <Fragment>
                                <Webcam
                                    key={webcamKey}
                                    audio={true}
                                    ref={webcamRef}
                                    className="absolute top-0 left-0 w-full h-full object-fill"
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

                        {/* If showPreview, display both WebM and MP4 side by side */}
                        {showPreview && recordedWebm && convertedMp4 && (
                            <Fragment>
                                <div className="absolute inset-0 flex flex-row gap-2 items-center justify-center bg-black/80 p-4">
                                    {/* Left: WebM Preview */}
                                    <div className="flex flex-col items-center">
                                        <h4 className="text-white mb-2 text-sm">WebM</h4>
                                        <video
                                            controls
                                            autoPlay
                                            className="border border-white"
                                            style={{ width: "280px", height: "350px", objectFit: "cover" }}
                                            src={URL.createObjectURL(recordedWebm)}
                                        />
                                    </div>
                                    {/* Right: MP4 Preview */}
                                    <div className="flex flex-col items-center">
                                        <h4 className="text-white mb-2 text-sm">MP4</h4>
                                        <video
                                            controls
                                            autoPlay
                                            className="border border-white"
                                            style={{ width: "280px", height: "auto", objectFit: "cover" }}
                                            src={URL.createObjectURL(convertedMp4)}
                                        />
                                    </div>
                                </div>
                                {/* Close button */}
                                <button
                                    onClick={closeRecording}
                                    className="absolute top-2 right-2 bg-gray-400 text-white px-2 py-1 rounded text-sm transition hover:opacity-80"
                                >
                                    ×
                                </button>
                            </Fragment>
                        )}
                    </div>
                </div>

                {/* Control Bar */}
                {showWebcam && !showPreview && (
                    <div className="w-full flex flex-row justify-center items-center">
                        <div className="flex items-center justify-center gap-5 bg-black rounded-full px-10 py-2 w-fit">
                            {/* Retry */}
                            <div>
                                <RotateCcw
                                    onClick={async () => {
                                        stoppingBecauseOfRetryRef.current = true;
                                        if (mediaRecorderRef.current && isRecording) {
                                            mediaRecorderRef.current.stop();
                                            setIsRecording(false);
                                            setIsPaused(false);
                                        }
                                        setTimer(0);
                                        setRecordedWebm(null);
                                        setConvertedMp4(null);
                                        setShowPreview(false);
                                        await startRecording();
                                    }}
                                    className="text-white size-6 cursor-pointer"
                                />
                            </div>

                            {/* Timer */}
                            <div className="text-white px-2 py-1 rounded text-base font-bold">
                                {formatTime(timer)}
                            </div>

                            {/* Stop */}
                            {isRecording && (
                                <button
                                    onClick={stopRecording}
                                    className="bg-red-500 text-white border-[3px] border-white w-10 h-10 rounded-full transition hover:opacity-80"
                                />
                            )}

                            {/* Pause/Resume */}
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

                            {/* Aspect toggles */}
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
                            {/* Close */}
                            <X onClick={closeRecording} className="text-white size-6 cursor-pointer" />
                        </div>
                    </div>
                )}

                {/* Hidden canvas for actual cropping */}
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
