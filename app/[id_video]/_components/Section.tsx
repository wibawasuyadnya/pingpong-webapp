'use client';
import React from 'react';
import VideoFeed from './Section-Components/VideoFeed';

const videoSources = [
    {
        id: "1",
        source: "/video/video_list_1.mp4",
        orientation: "portrait",
        authorName: "Kadek Tai Kucing",
        authorProfilePicture: "",
        description: "Check out this awesome video!",
    }, 
    { 
        id: "2", 
        source: '/video/video_list_2.mp4', 
        orientation: 'landscape',
        authorName: "Iwan Gigi Bolong",
        authorProfilePicture: "",
        description: "Check out this awesome video!", 
    },
    { 
        id: "3", 
        source: '/video/video_list_3.mp4', 
        orientation: 'landscape',
        authorName: "Eric raja boncos",
        authorProfilePicture: "",
        description: "Eric raja boncos saya rugi 300 ribu gara gara dia", 
    },
    {   
        id: "4", 
        source: '/video/video_list_4.mp4', 
        orientation: 'portrait',
        authorName: "Ka Agus ga kebagian roti",
        authorProfilePicture: "",
        description: "Check out this awesome video!", 
    },
    {  
        id: "5", 
        source: '/video/video_list_5.mp4', 
        orientation: 'portrait',
        authorName: "Ka Victor kang maling roti ka agus",
        authorProfilePicture: "",
        description: "Check out this awesome video!",
    },
];

export default function Section() {
    return (
        <div className='overflow-hidden no-scrollbar'>
            <VideoFeed sources={videoSources} />
        </div>
    );
}