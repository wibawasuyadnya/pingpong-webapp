'use client';
import React, { Fragment } from 'react';
import VideoFeed from './Section-Components/VideoFeed';

const videoSources = [
    { source: '/video/video_list_1.mp4', orientation: 'portrait' },
    { source: '/video/video_list_2.mp4', orientation: 'landscape' },
    { source: '/video/video_list_3.mp4', orientation: 'landscape' },
    { source: '/video/video_list_4.mp4', orientation: 'portrait' },
    { source: '/video/video_list_5.mp4', orientation: 'portrait' },
];

export default function Section() {
    return (
        <div className='overflow-hidden no-scrollbar'>
            <VideoFeed sources={videoSources} />
        </div>
    );
}