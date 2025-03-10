// app/[id_video]/_components/Section-Components/VideoFeed-Components/VideoSkeleton.tsx
'use client';
import React from 'react';

const VideoSkeleton = () => {
    return (
        <div className="w-full max-w-[400px] h-[650px] bg-gray-300 animate-pulse rounded-lg" />
    );
};

export default VideoSkeleton;
