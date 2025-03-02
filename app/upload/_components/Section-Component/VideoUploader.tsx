"use client";
import React, { useRef, useState } from "react";
import { FileVideo, Proportions, Upload, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hook";
import { setVideo } from "@/redux/slices/videoSlice";

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

export default function VideoUploader() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const [fileName, setFileName] = useState<string>("");
  const [fileSizeMB, setFileSizeMB] = useState<number>(0);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  async function handleSelectedFile(file: File) {
    // Update local states
    setSelectedVideo(file);
    setFileName(file.name);
    setFileSizeMB(file.size / (1024 * 1024));

    // 1) Convert to base64
    const base64Video = await fileToBase64(file);

    // 2) Dispatch to Redux
    dispatch(
      setVideo({
        base64Data: base64Video,
        size: file.size,
        type: file.type,
      })
    );

    // 3) Remove extension, then remove spaces => dashes
    let baseName = file.name.replace(/\.[^/.]+$/, ""); // remove extension
    baseName = baseName.replace(/\s+/g, "-");         // replace spaces with '-'

    // 4) Navigate
    router.push(`/upload/${encodeURIComponent(baseName)}?post=new`);
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      await handleSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      await handleSelectedFile(file);
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
            <Upload className="mx-auto size-20" />
            <h2 className="text-xl font-bold text-center">
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
            {/* Simple info, but no real progress here, because real upload is on the post page */}
            <p className="font-semibold text-base">File: {fileName}</p>
            <p className="text-sm">Size: {fileSizeMB.toFixed(2)} MB</p>
            <p className="text-sm text-gray-600">
              Redirecting to post page...
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-4">
          <Video className="size-7" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Size and duration</h3>
            <p className="font-light text-sm">
              Maximum size: 500 MB, video duration: 5 minutes.
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <span className="icon-[mdi--aspect-ratio] size-7"></span>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              Resolutions and aspect ratios
            </h3>
            <p className="font-light text-sm">
              High resolutions are recommended: 1080p.
              <br />
              Ratios recommended: 9:16 vertical or 16:9 landscape
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <FileVideo className="size-7" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Video format</h3>
            <p className="font-light text-sm">
              Recommended: “.mp4” and “.mov” are supported file formats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
