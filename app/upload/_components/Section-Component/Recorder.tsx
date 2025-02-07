"use client";
import React, {
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  useEffect,
} from "react";
import Webcam from "react-webcam";

export interface RecorderSectionHandle {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  recordedBlob: Blob | null;
  isRecording: boolean;
}

interface RecorderSectionProps {
  mode: "camera" | "screen";
}

const RecorderSection = forwardRef<RecorderSectionHandle, RecorderSectionProps>(
  ({ mode }, ref) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    // For screen mode, use hidden video elements and a canvas.
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const overlayCameraVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // For camera-only mode, use react-webcam.
    const webcamRef = useRef<Webcam>(null);

    const startRecording = async () => {
      if (mode === "screen") {
        // --- Screen Recording Mode ---
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
          await screenVideoRef.current.play();
        }
        if (overlayCameraVideoRef.current) {
          overlayCameraVideoRef.current.srcObject = cameraStream;
          await overlayCameraVideoRef.current.play();
        }

        const canvas = canvasRef.current;
        if (!canvas || !screenVideoRef.current || !overlayCameraVideoRef.current)
          return;
        canvas.width = screenVideoRef.current.videoWidth || 1280;
        canvas.height = screenVideoRef.current.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const drawFrame = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(screenVideoRef.current!, 0, 0, canvas.width, canvas.height);
          const overlaySize = Math.min(canvas.width, canvas.height) / 4;
          const x = canvas.width - overlaySize - 20;
          const y = canvas.height - overlaySize - 20;
          ctx.save();
          ctx.beginPath();
          ctx.arc(x + overlaySize / 2, y + overlaySize / 2, overlaySize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(overlayCameraVideoRef.current!, x, y, overlaySize, overlaySize);
          ctx.restore();
          requestAnimationFrame(drawFrame);
        };
        drawFrame();

        const combinedStream = canvas.captureStream(30);
        screenStream.getAudioTracks().forEach((track) => {
          combinedStream.addTrack(track);
        });

        const options = { mimeType: "video/mp4" };
        const mediaRecorder = new MediaRecorder(combinedStream, options);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: "video/mp4" });
          setRecordedBlob(blob);
          screenStream.getTracks().forEach((track) => track.stop());
          cameraStream.getTracks().forEach((track) => track.stop());
        };
        mediaRecorder.start();
        setIsRecording(true);
      } else {
        // --- Camera-Only Mode ---
        // Use react-webcam's stream.
        const stream = webcamRef.current?.video?.srcObject as MediaStream | undefined;
        if (!stream) {
          console.error("Webcam stream not available");
          return;
        }
        const options = { mimeType: "video/mp4" };
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: "video/mp4" });
          setRecordedBlob(blob);
          stream.getTracks().forEach((track) => track.stop());
        };
        mediaRecorder.start();
        setIsRecording(true);
      }
    };

    const stopRecording = () => {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    };

    useImperativeHandle(ref, () => ({
      startRecording,
      stopRecording,
      recordedBlob,
      isRecording,
    }));

    // Render different UI based on the mode.
    if (mode === "screen") {
      return (
        <div className="hidden">
          {/* These elements are used for compositing in screen mode */}
          <video ref={screenVideoRef} className="hidden" />
          <video ref={overlayCameraVideoRef} className="hidden" />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      );
    } else {
      return (
        <div className="p-4">
          {/* Show the react-webcam preview for camera-only mode */}
          <Webcam
            audio={true}
            ref={webcamRef}
            videoConstraints={{ facingMode: "user" }}
            className="w-[600px] border rounded-lg"
          />
        </div>
      );
    }
  }
);

RecorderSection.displayName = "RecorderSection";
export default RecorderSection;
