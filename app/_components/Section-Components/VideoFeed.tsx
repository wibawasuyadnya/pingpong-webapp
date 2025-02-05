'use client';
import React, { useRef, useEffect, useState } from 'react';

interface VideoFeedProps {
    videoSources: string[];
}

export default function VideoFeed({ videoSources }: VideoFeedProps) {
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);

    useEffect(() => {
        const options = {
            rootMargin: '0px',
            threshold: 0.5,
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const video = entry.target as HTMLVideoElement;
                    video.play();

                    // Mute/unmute based on sound state
                    video.muted = !isSoundEnabled;
                } else {
                    const video = entry.target as HTMLVideoElement;
                    video.pause();
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);

        videoRefs.current.forEach((videoRef) => {
            if (videoRef) {
                observer.observe(videoRef);
            }
        });

        return () => {
            videoRefs.current.forEach((videoRef) => {
                if (videoRef) {
                    observer.unobserve(videoRef);
                }
            });
        };
    }, [isSoundEnabled]);

    const toggleSound = () => {
        setIsSoundEnabled(!isSoundEnabled);

        // Update muted state for all videos
        videoRefs.current.forEach((videoRef) => {
            if (videoRef) {
                videoRef.muted = !isSoundEnabled;
            }
        });
    };

    return (
        <div className="max-h-[600px] overflow-y-scroll snap-y snap-mandatory no-scrollbar">
            {videoSources.map((src, index) => (
                <div
                    key={index}
                    className="relative h-fit w-full flex items-center justify-center snap-start"
                >
                    <div className="relative w-full max-w-full h-fit mt-4 flex items-center justify-center">
                        <video
                            ref={(el) => {
                                videoRefs.current[index] = el;
                            }}
                            src={src}
                            loop
                            muted={!isSoundEnabled}
                            playsInline
                            className="max-w-full max-h-[600px] object-contain rounded-lg"
                        />

                        {/* Sound Toggle Button */}
                        {/* <button
                            onClick={toggleSound}
                            className="absolute top-0 -right-1 z-10 bg-black/50 rounded-full p-2 text-white"
                        >
                            {isSoundEnabled ? <Volume2 /> : <VolumeX />}
                        </button> */}
                    </div>
                </div>
            ))}
        </div>
    );
}