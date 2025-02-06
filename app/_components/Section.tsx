'use client';
import React, { Fragment } from 'react';
import VideoFeed from './Section-Components/VideoFeed';


const videoSources = [
    '/video/video_list_1.mp4',
    '/video/video_list_2.mp4',
    '/video/video_list_3.mp4',
    '/video/video_list_4.mp4',
    '/video/video_list_5.mp4',
];

export default function Section() {
    return (
        <Fragment>
            <VideoFeed videoSources={videoSources} />
        </Fragment>
    );
}