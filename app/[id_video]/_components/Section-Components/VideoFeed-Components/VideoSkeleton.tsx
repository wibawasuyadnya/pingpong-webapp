import React from "react";

const VideoSkeleton = ({ orientation }: { orientation: 'portrait' | 'landscape' }) => {
    const skeletonClass = orientation === 'portrait' ? 'w-[350px] h-[650px]' : 'w-[770px] h-[500px]';
    return (
        <div className={`relative ${skeletonClass} bg-gray-800 rounded-lg animate-pulse`}>
            <div className="w-full h-full bg-gray-700 rounded-lg" />
        </div>
    );
};

export default VideoSkeleton;