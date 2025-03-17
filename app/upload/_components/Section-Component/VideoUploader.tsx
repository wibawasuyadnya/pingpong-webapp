"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hook";
import { setVideo } from "@/redux/slices/videoSlice";
import { Upload, Video, FileVideo } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { Trash } from "iconsax-react";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function VideoUploader({
  replyVideo,
}: {
  replyVideo: string | undefined;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);


  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSizeMB, setFileSizeMB] = useState(0);


  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("idle");

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      await handleSelectedFile(file);
    }
  };


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      await handleSelectedFile(file);
    }
  };

  async function handleSelectedFile(file: File) {
    setSelectedVideo(file);
    setFileName(file.name);
    const sizeMB = file.size / (1024 * 1024);
    setFileSizeMB(sizeMB);

    // Convert file to base64 and store in Redux
    const base64Video = await fileToBase64(file);
    dispatch(
      setVideo({
        base64Data: base64Video,
        size: file.size,
        type: file.type,
      })
    );

    const originalName = file.name;
    const ext = originalName.substring(originalName.lastIndexOf(".") + 1);
    // ext = "mkv" (or "mp4", "mov", etc.)

    const randomId = crypto.randomUUID();
    const newFilename = `${randomId}.${ext}`;

    // Start “uploading” progress simulation
    setProgress(0);
    setStatus("uploading");

    // Fake upload rate and progress
    const uploadRateMBps = 5;
    const totalTimeSec = sizeMB / uploadRateMBps;
    const intervalMs = 100;
    let intervalsCount = Math.ceil((totalTimeSec * 1000) / intervalMs);
    intervalsCount = Math.max(intervalsCount, 5);
    intervalsCount = Math.min(intervalsCount, 1000);

    let currentInterval = 0;
    const timer = setInterval(() => {
      currentInterval++;
      const increment = 100 / intervalsCount;
      setProgress((prev) => {
        const newVal = prev + increment;
        return newVal > 100 ? 100 : newVal;
      });

      if (currentInterval >= intervalsCount) {
        clearInterval(timer);
        setProgress(100);
        setStatus("success");

        // Once “upload” completes, navigate to /upload/<random>.mp4?post=...
        setTimeout(() => {
          router.push(
            `/upload/${newFilename}?post=${replyVideo !== undefined ? replyVideo : "new"}`
          );
        }, 800);
      }
    }, intervalMs);
  }



  const handleRemove = () => {
    setSelectedVideo(null);
    setFileName("");
    setFileSizeMB(0);
    setProgress(0);
    setStatus("idle");
  };


  const handleRetry = () => {
    if (selectedVideo) {
      handleSelectedFile(selectedVideo);
    }
  };

  return (
    <div
      className="bg-white rounded-md h-fit px-5 pb-8 space-y-5"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="border border-dashed rounded-lg bg-[#F0F0F0] h-auto min-h-[400px] flex flex-col justify-center items-center p-4">
        <input
          type="file"
          accept="video/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {!selectedVideo ? (

          <div className="flex flex-col gap-3 justify-center items-center w-fit">
            <Upload className="mx-auto size-20 text-black" />
            <h2 className="text-xl font-bold text-center text-black">
              Select video to upload
            </h2>
            <p className="text-base text-[#707070] font-normal text-center">
              Or drag and drop here
            </p>
            <button
              style={{
                background: "linear-gradient(180deg, #D241AA 0%, #C42BDD 100%)",
              }}
              className="text-white px-10 py-2 rounded-lg font-semibold text-lg w-fit mx-auto"
              onClick={handleUploadClick}
            >
              Select Video
            </button>
          </div>
        ) : (

          <div className="flex flex-col gap-3 justify-center items-center w-full">
            <div className="w-full max-w-[400px] bg-white p-3 rounded-lg border border-[#DDDDDD] space-y-2 relative">
              {/* File name + size + remove button */}
              <div className="flex flex-row justify-between items-start">
                <div>
                  <h1 className="text-sm font-normal text-black">{fileName}</h1>
                  <p className="text-xs text-black">
                    {fileSizeMB.toFixed(2)} MB
                  </p>
                </div>

                <button onClick={handleRemove}>
                  <Trash size="20px" color="#353535" className="text-gray-600 hover:text-black" />
                </button>
              </div>

              {/* Progress / status display */}
              {status === "uploading" && (
                <div>
                  {/* Purple bar + percentage */}
                  <div className="w-full bg-[#F1F1F1] h-2 rounded-full relative mt-2 overflow-hidden">
                    <div
                      className="bg-[#B14AE2] h-2 rounded-full transition-all duration-100 linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-black">
                    {Math.round(progress)}%
                  </div>
                </div>
              )}

              {status === "success" && (
                <div>
                  {/* Green bar + check icon */}
                  <div className="w-full bg-[#F1F1F1] h-2 rounded-full relative mt-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-200 linear"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="flex flex-row items-center gap-2 text-green-600 text-sm mt-2">
                    <CheckCircle2 size={18} />
                    <span>Upload Complete</span>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="text-red-600 space-y-2">
                  <p className="text-sm font-semibold">
                    Upload failed, please try again
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-4 py-1 bg-red-600 text-white rounded-lg text-sm"
                  >
                    Try again
                  </button>
                </div>
              )}

              {status === "idle" && (
                <p className="text-xs text-gray-600">Ready to upload</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional info sections */}
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-4">
          <Video className="size-7 text-black" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-black">Size and duration</h3>
            <p className="font-light text-sm text-black">
              Maximum size: 500 MB, video duration: 5 minutes.
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <span className="icon-[mdi--aspect-ratio] size-7 text-black"></span>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-black">
              Resolutions and aspect ratios
            </h3>
            <p className="font-light text-sm text-black">
              High resolutions are recommended: 1080p.
              <br />
              Ratios recommended: 9:16 vertical or 16:9 landscape
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <FileVideo className="size-7 text-black" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-black">Video format</h3>
            <p className="font-light text-sm text-black">
              Recommended: “.mp4” and “.mov” are supported file formats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
