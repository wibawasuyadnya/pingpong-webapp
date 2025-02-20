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
import { Circle, CirclePause, Pause, Play, RectangleHorizontal, RectangleVertical, RotateCcw, X } from "lucide-react";

export interface CameraRecorderHandle {
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    recordedBlob: Blob | null;
    isRecording: boolean;
}

const CameraRecorder = forwardRef<CameraRecorderHandle, {}>((_props, ref) => {
    // ------------------- STATE -------------------
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

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

    // ------------------- REFS -------------------
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const webcamRef = useRef<Webcam>(null);

    // Draggable container & hidden canvas for real-time cropping
    const draggableRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    // ------------------- DIMENSIONS -------------------
    // Overall container size
    const containerWidth = 600; // parent width
    const containerHeight = 600; // parent height

    // The webcam/preview box is 450px tall
    const webcamBoxHeight = 450;

    // bounding box logic uses webcamBoxHeight for portrait or containerWidth for landscape
    const boundingWidth =
        aspect === "portrait" ? (9 / 16) * webcamBoxHeight : containerWidth;
    const boundingHeight =
        aspect === "portrait" ? webcamBoxHeight : (9 / 16) * containerWidth;

    // Center the bounding box horizontally
    const boundingLeft = (containerWidth - boundingWidth) / 2;
    // Center (or shift) it vertically within the 450px region
    const boundingTop = (webcamBoxHeight - boundingHeight) / 2;

    // ------------------- UTILS -------------------
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // ------------------- DRAW LOOP -------------------
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
        // "object-fill" => the video fully occupies the 600×450 region
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

    // ------------------- RECORDING LOGIC -------------------
    const startRecording = async () => {
        setShowPreview(false);

        if (!showWebcam) {
            setShowWebcam(true);
            // Wait until the video is ready
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

        // Add audio from original webcam
        originalStream.getAudioTracks().forEach((track) => {
            canvasStream.addTrack(track);
        });

        let mimeType = "video/mp4";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            console.warn("video/mp4 not supported; falling back to video/webm");
            mimeType = "video/webm";
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

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                setRecordedBlob(blob);

                originalStream.getTracks().forEach((t) => t.stop());
                setShowWebcam(false);
                setShowPreview(true);

                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                setTimer(0);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);

            // Timer
            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error starting MediaRecorder:", error);
        }
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
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
        setTimer(0);
        setRecordedBlob(null);
        setShowPreview(false);
        await startRecording();
    };

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

        setRecordedBlob(null);
        setShowPreview(false);
        setShowWebcam(false);
    };

    // ------------------- IMPERATIVE HANDLE -------------------
    useImperativeHandle(ref, () => ({
        startRecording,
        stopRecording,
        recordedBlob,
        isRecording,
    }));

    // If neither webcam nor preview is shown, we render nothing
    if (!showWebcam && !showPreview) return null;

    // Overlays outside bounding box (for portrait or landscape)
    // 1) top
    const topOverlayStyle = {
        top: 0,
        left: 0,
        width: "100%",
        height: boundingTop,
    };
    // 2) bottom
    const bottomOverlayStyle = {
        top: boundingTop + boundingHeight,
        left: 0,
        width: "100%",
        height: webcamBoxHeight - (boundingTop + boundingHeight),
    };
    // 3) left
    const leftOverlayStyle = {
        top: boundingTop,
        left: 0,
        width: boundingLeft,
        height: boundingHeight,
    };
    // 4) right
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
                <div>
                    <div className="rounded-t-lg bg-black px-3 py-2">
                        <span className="font-semibold text-white">Recorder Preview</span>
                    </div>
                    {/* 1) Webcam or Preview Container (rounded corners) */}
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

                                {/* Dashed bounding box */}
                                <div
                                    className="absolute border-2 border-dashed border-white pointer-events-none"
                                    style={{
                                        top: boundingTop,
                                        left: boundingLeft,
                                        width: boundingWidth,
                                        height: boundingHeight,
                                    }}
                                />

                                {/* Overlays: top, bottom, left, right */}
                                <div className="absolute bg-black/50" style={topOverlayStyle} />
                                <div className="absolute bg-black/50" style={bottomOverlayStyle} />
                                <div className="absolute bg-black/50" style={leftOverlayStyle} />
                                <div className="absolute bg-black/50" style={rightOverlayStyle} />
                            </Fragment>
                        )}

                        {/* If showPreview, display the final cropped video */}
                        {showPreview && recordedBlob && (
                            <Fragment>
                                <video
                                    controls
                                    autoPlay
                                    className="absolute"
                                    style={{
                                        top: boundingTop,
                                        left: boundingLeft,
                                        width: boundingWidth,
                                        height: boundingHeight,
                                        objectFit: "cover",
                                    }}
                                    src={URL.createObjectURL(recordedBlob)}
                                />
                                {/* Overlays: top, bottom, left, right */}
                                <div className="absolute bg-black/50" style={topOverlayStyle} />
                                <div className="absolute bg-black/50" style={bottomOverlayStyle} />
                                <div className="absolute bg-black/50" style={leftOverlayStyle} />
                                <div className="absolute bg-black/50" style={rightOverlayStyle} />

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

                {/* 2) Control Bar (separate container) */}
                {showWebcam && !showPreview && (
                    <div className="w-full flex flex-row justify-center items-center">
                        <div className="flex items-center justify-center gap-5 bg-black rounded-full px-10 py-2 w-fit">
                            {/* Retry */}
                            <div>
                                <RotateCcw onClick={retryRecording} className="text-white size-6 cursor-pointer" />
                            </div>

                            {/* Timer (top-left corner) */}
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
                                    className={`flex-row flex gap-2 justify-center items-center px-3 py-3 text-white rounded-full text-sm transition hover:opacity-80 ${aspect === "portrait" ? "bg-purple-600" : "bg-transparent"
                                        }`}
                                >
                                    <RectangleVertical />

                                    9:16
                                </button>
                                <button
                                    onClick={() => setAspect("landscape")}
                                    className={` flex-row flex gap-2 justify-center items-center px-3 py-3 text-white rounded-full text-sm transition hover:opacity-80 ${aspect === "landscape" ? "bg-purple-600" : "bg-transparent"
                                        }`}
                                >
                                    <RectangleHorizontal />
                                    16:9
                                </button>
                            </div>
                            {/* Close button (top-right corner) */}
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
