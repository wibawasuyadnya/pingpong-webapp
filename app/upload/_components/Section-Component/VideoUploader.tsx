"use client";
import React, { useRef, useState, useEffect } from "react";
import { FileVideo, Proportions, Upload, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hook";
import { setVideo } from "@/redux/slices/videoSlice";
import { fileToBase64 } from "@/utils/fileToBase64";

export default function VideoUploader() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The selected file from drag/drop or file input
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  // We'll store the file's name and size
  const [fileName, setFileName] = useState<string>("");
  const [fileSizeMB, setFileSizeMB] = useState<number>(0);

  // True upload progress (0 to 100)
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedVideo(file);
      setFileName(file.name);
      setFileSizeMB(file.size / (1024 * 1024));
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
      setSelectedVideo(file);
      setFileName(file.name);
      setFileSizeMB(file.size / (1024 * 1024));
    }
  };

  // Once we have a selected file, start the real upload with XHR
  useEffect(() => {
    if (!selectedVideo) {
      setProgress(0);
      setUploading(false);
      setErrorMessage("");
      return;
    }

    (async () => {
      try {
        setUploading(true);
        setProgress(0);
        setErrorMessage("");

        const base64Video = await fileToBase64(selectedVideo);
        // Dispatch to Redux
        dispatch(
          setVideo({
            base64Data: base64Video,
            size: selectedVideo.size,
            type: selectedVideo.type,
          })
        );

        const formData = new FormData();
        formData.append("video", selectedVideo, selectedVideo.name);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/video");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        };

        xhr.onload = () => {
          setUploading(false);
          if (xhr.status === 200) {
            try {
              const res = JSON.parse(xhr.responseText);
              const s3Key = res.filename || "no-name";
              // navigate to /upload/[s3Key]?post=new
              router.push(`/upload/${encodeURIComponent(s3Key)}?post=new`);
            } catch (err) {
              console.error("Failed to parse response:", err);
              setErrorMessage("Upload succeeded, but response invalid.");
            }
          } else {
            console.error("Upload error, status:", xhr.status, xhr.statusText);
            setErrorMessage(`Upload failed with status ${xhr.status}`);
          }
        };

        xhr.onerror = () => {
          console.error("XHR error:", xhr.statusText);
          setErrorMessage("Upload failed due to network error.");
          setUploading(false);
        };

        xhr.send(formData);
      } catch (err) {
        console.error("Error reading file or uploading:", err);
        setErrorMessage("Error preparing file upload.");
        setUploading(false);
      }
    })();
  }, [selectedVideo, dispatch, router]);

  return (
    <div
      className="bg-white rounded-md h-fit px-5 py-8 space-y-5"
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
            <div className="flex flex-col items-center gap-2">
              <p className="font-semibold text-base">File: {fileName}</p>
              <p className="text-sm">Size: {fileSizeMB.toFixed(2)} MB</p>
            </div>
            {/* Real progress bar */}
            <div className="w-3/4 bg-gray-300 h-4 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {uploading
                ? `Uploading... ${progress}%`
                : progress === 100
                  ? "Upload finished"
                  : ""}
            </p>
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
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
