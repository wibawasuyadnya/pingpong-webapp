"use client"; 
import React, { Fragment, useRef, useState } from "react";

export default function Section() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
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
        
        const files = event.dataTransfer.files;
        const file = files[0];
        
        if (file && file.type.startsWith('video/')) {
            setSelectedVideo(file);
        }
    };

    return (
        <Fragment>
            <div 
                className="bg-white rounded-md h-[600px] p-5"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="border border-dashed rounded-lg bg-[#f8f8f8] border-1 h-full flex flex-col justify-center items-center">
                    <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    {selectedVideo ? (
                        <div className="flex flex-col gap-3 justify-center items-center">
                            <video 
                                controls 
                                className="max-w-full max-h-[500px]"
                            >
                                <source 
                                    src={URL.createObjectURL(selectedVideo)} 
                                    type={selectedVideo.type} 
                                />
                                Your browser does not support the video tag.
                            </video>
                            <p>{selectedVideo.name}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 justify-center item-center w-full">
                            <span className="icon-[garden--upload-fill-16] text-grey-600 mx-auto size-25"></span>
                            <h2 className="text-xl font-bold text-center"> Select video to upload</h2>
                            <p className="text-lg font-normal text-center"> Or drag and drop here</p>
                            <button
                                className="bg-primary text-white px-5 py-3 rounded font-semibold text-lg w-fit mx-auto"
                                onClick={handleUploadClick}
                            >
                                Select Video
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
}