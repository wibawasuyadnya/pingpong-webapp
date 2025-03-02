'use client';
import React from 'react';
import VideoFeed from './Section-Components/VideoFeed';

const videoSources = [
    { id: "1", source: '/video/video_list_1.mp4', orientation: 'portrait' },
    { id: "2", source: '/video/video_list_2.mp4', orientation: 'landscape' },
    { id: "3", source: '/video/video_list_3.mp4', orientation: 'landscape' },
    { id: "4", source: '/video/video_list_4.mp4', orientation: 'portrait' },
    { id: "5", source: '/video/video_list_5.mp4', orientation: 'portrait' },
];

export default function Section() {
    return (
        <div className='overflow-hidden no-scrollbar'>
            <VideoFeed sources={videoSources} />
        </div>
    );
}