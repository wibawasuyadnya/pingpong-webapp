'use client';
import React, { useRef, useEffect, useState } from 'react';

interface VideoSource {
    source: string;
    orientation: string;
}

interface VideoFeedProps {
    sources: VideoSource[];
}

export default function VideoFeed({ sources }: VideoFeedProps) {
    // Reference to the scroll container
    const containerRef = useRef<HTMLDivElement>(null);
    // References to each video element
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);

    // Intersection Observer to auto-play/pause videos based on visibility
    useEffect(() => {
        const options = {
            rootMargin: '0px',
            threshold: 0.5,
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                const video = entry.target as HTMLVideoElement;
                if (entry.isIntersecting) {
                    video.play();
                    video.muted = !isSoundEnabled;
                } else {
                    video.pause();
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);

        videoRefs.current.forEach((video) => {
            if (video) {
                observer.observe(video);
            }
        });

        return () => {
            videoRefs.current.forEach((video) => {
                if (video) {
                    observer.unobserve(video);
                }
            });
        };
    }, [isSoundEnabled]);

    // Custom onScroll handler to auto-snap to the nearest video after scrolling stops.
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            clearTimeout(timeoutId);
            // Wait for scroll to stop (100ms debounce)
            timeoutId = setTimeout(() => {
                const containerTop = container.getBoundingClientRect().top;
                let closestIndex = 0;
                let minDistance = Infinity;

                videoRefs.current.forEach((video, index) => {
                    if (video) {
                        const rect = video.getBoundingClientRect();
                        const distance = Math.abs(rect.top - containerTop);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestIndex = index;
                        }
                    }
                });

                // Smoothly scroll the closest video into view
                videoRefs.current[closestIndex]?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    // Toggle sound state (and update each video's muted property)
    const toggleSound = () => {
        setIsSoundEnabled((prev) => !prev);
        videoRefs.current.forEach((video) => {
            if (video) {
                video.muted = isSoundEnabled; // Note: uses previous state here.
            }
        });
    };

    return (
        <div
            ref={containerRef}
            className="h-[600px] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
            style={{ overscrollBehavior: 'contain' }} // Prevents over-scrolling momentum
        >
            {sources.map((video, index) => {
                // Set the video width based on orientation.
                const videoWidthClass =
                    video.orientation === 'portrait' ? 'w-[300px]' : 'w-[800px]';
                // Add extra padding for landscape videos.
                const containerPaddingClass =
                    video.orientation === 'landscape' ? 'p-4' : '';

                return (
                    <div
                        key={index}
                        className="relative h-[600px] w-full flex items-center justify-center snap-start"
                        style={{ scrollSnapStop: 'always' }}
                    >
                        <div
                            className={`relative flex items-center justify-center ${containerPaddingClass}`}
                        >
                            <video
                                ref={(el) => {
                                    videoRefs.current[index] = el;
                                }}
                                src={video.source}
                                loop
                                muted={!isSoundEnabled}
                                playsInline
                                className={`object-cover rounded-lg ${videoWidthClass}`}
                                style={{ maxHeight: '100%', maxWidth: '100%' }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
