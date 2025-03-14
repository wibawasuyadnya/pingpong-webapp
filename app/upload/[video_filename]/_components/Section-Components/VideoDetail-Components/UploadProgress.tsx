"use client";
import { X, Check } from "lucide-react";
import React from "react";

interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
  isSuccess: boolean | null;
  error: string | null;
  onCancel: () => void;
}

export default function UploadProgress({
  progress,
  isUploading,
  isSuccess,
  error,
  onCancel,
}: UploadProgressProps) {
  
  if (isSuccess === true) {
    return (
      <div className="bg-[#F9F4FF] p-4 rounded-lg shadow-md w-full flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-green-600 font-semibold">Successfully posted!</span>
          <Check className="text-green-600" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">100%</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded">
          <div className="bg-green-600 h-2 rounded" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F9F4FF] p-4 rounded-lg shadow-md w-full flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-red-600 font-semibold">Upload failed</span>
          <button onClick={onCancel}>
            <X className="text-red-600" />
          </button>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="bg-[#F9F4FF] p-4 rounded-lg shadow-md w-full flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-purple-600 font-semibold">
            Uploading... Stay on this screen.
          </span>
          <button onClick={onCancel}>
            <X className="text-purple-600" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="bg-purple-600 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return null;
}
