// VideoUploader.tsx
"use client";
import React, { useRef, useState } from "react";
import { FileVideo, Proportions, Upload, Video } from "lucide-react";

export default function VideoUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedVideo(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedVideo(file);
    }
  };

  return (
    <div
      className="bg-white rounded-md h-fit px-5 py-8 space-y-5"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="border border-dashed rounded-lg bg-[#F0F0F0] h-[300px] flex flex-col justify-center items-center">
        <input
          type="file"
          accept="video/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {selectedVideo ? (
          <div className="flex flex-col gap-3 justify-center items-center">
            <video controls className="max-w-full max-h-[500px]">
              <source
                src={URL.createObjectURL(selectedVideo)}
                type={selectedVideo.type}
              />
              Your browser does not support the video tag.
            </video>
            <p>{selectedVideo.name}</p>
          </div>
        ) : (
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
          <Proportions className="size-7" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Resolutions and aspect ratios</h3>
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
