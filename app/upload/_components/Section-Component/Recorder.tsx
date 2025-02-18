"use client";
import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Webcam from "react-webcam";
import Draggable from "react-draggable";

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
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [showWebcam, setShowWebcam] = useState(false);
    const recordedChunksRef = useRef<Blob[]>([]);

    // For camera-only mode.
    const webcamRef = useRef<Webcam>(null);
    // Create a ref for the draggable container.
    const draggableRef = useRef<HTMLDivElement>(null);

    const startRecording = async () => {
      if (mode === "screen") {
      } else {
        // --- Camera-Only Mode ---
        if (!showWebcam) {
          setShowWebcam(true);
          return;
        }

        // Once the webcam is mounted, grab its stream.
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
          // Stop all tracks when recording stops.
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

    if (mode === "screen") {
      return (
        <div className="hidden">
          {/* Hidden elements for compositing in screen mode */}
          <video ref={null} className="hidden" />
          <video ref={null} className="hidden" />
          <canvas ref={null} className="hidden" />
        </div>
      );
    } else {
      // For camera-only mode, render a draggable popup (picture-in-picture)
      return showWebcam && (
        <Draggable nodeRef={draggableRef as React.RefObject<HTMLElement>}>
          <div
            ref={draggableRef}
            className="fixed bottom-4 right-4 p-2 bg-white border border-gray-300 shadow-lg rounded-lg z-50"
          >

            <Webcam
              audio={true}
              ref={webcamRef}
              videoConstraints={{ facingMode: "user" }} // Use the front camera.
              className="w-[600px] rounded-lg"
            />
          </div>
        </Draggable>
      );
    }
  }
);
export default RecorderSection;
