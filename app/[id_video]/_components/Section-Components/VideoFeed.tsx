'use client';
import { useRouter, usePathname } from 'next/navigation';
import React, { useRef, useEffect, useState } from 'react';
import VideoFeedPlayer from './VideoFeed-Components/VideoPlayer';
import SideControlBar from './VideoFeed-Components/SideControlBar';

interface VideoSource {
    id: string;
    source: string;
    orientation: string;
    authorName?: string;
    authorProfilePicture?: string;
    description?: string;
}

interface VideoFeedProps {
    sources: VideoSource[];
}

export default function VideoFeed({ sources }: VideoFeedProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    // Set sound state from localStorage (default: muted)
    const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
        return localStorage.getItem('soundEnabled') === 'true' ? true : false;
    });

    const router = useRouter();
    const pathname = usePathname();

    // Intersection Observer: Pause videos that are not in view
    useEffect(() => {
        const options = { rootMargin: '0px', threshold: 0.5 };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                const video = entry.target as HTMLVideoElement;
                if (!entry.isIntersecting && !video.paused) {
                    video.pause();
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);
        videoRefs.current.forEach((video) => video && observer.observe(video));

        return () => videoRefs.current.forEach((video) => video && observer.unobserve(video));
    }, []);

    // Auto-snap to the nearest video and update URL on scroll
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            clearTimeout(timeoutId);
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

                // Get the active video
                const activeVideo = videoRefs.current[closestIndex];

                // Ensure the video exists before using it
                if (activeVideo) {
                    // Prevent redundant scrollIntoView calls
                    if (!activeVideo.classList.contains('active-video')) {
                        activeVideo.classList.add('active-video');
                        activeVideo.scrollIntoView({ behavior: 'smooth' });

                        // Only play if currently paused
                        if (activeVideo.paused) {
                            activeVideo.play().catch((err) => console.warn("Play interrupted:", err.message));
                        }
                    }
                }

                // Update URL if needed
                const newPath = `/${sources[closestIndex].id}`;
                if (pathname !== newPath) {
                    router.replace(newPath);
                }
            }, 50);
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [sources, pathname, router]);


    // Play the active video when the URL (pathname) changes
    useEffect(() => {
        const currentId = pathname.replace('/', '');
        const activeIndex = sources.findIndex((video) => video.id === currentId);

        videoRefs.current.forEach((video, index) => {
            if (video) {
                if (index === activeIndex) {
                    video.scrollIntoView({ behavior: 'auto' });

                    // Ensure we only play if the video is not playing already
                    if (video.paused) {
                        video.play().catch((err) => console.warn("Play interrupted:", err.message));
                    }
                } else {
                    video.pause();
                }
            }
        });
    }, [pathname, sources]);


    // Toggle sound state and store preference
    const toggleSound = () => {
        setIsSoundEnabled((prev) => {
            const newState = !prev;
            localStorage.setItem('soundEnabled', newState ? 'true' : 'false');
            videoRefs.current.forEach((video) => {
                if (video) video.muted = !newState;
            });
            return newState;
        });
    };

    return (
        <div
            ref={containerRef}
            className="h-[650px] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
            style={{ overscrollBehavior: 'contain' }}
        >
            {sources.map((video, index) => {
                const videoWidthClass = video.orientation === 'portrait' ? 'w-[350px]' : 'w-[800px]';
                const containerPaddingClass = video.orientation === 'landscape' ? 'p-4' : '';
                const controlsBottomClass = video.orientation === 'portrait' ? 'bottom-0 -right-16' : 'bottom-5 -right-13';
                return (
                    <div
                        key={video.id}
                        className="relative h-[650px] w-full flex items-center justify-center snap-start"
                        style={{ scrollSnapStop: 'always' }}
                    >
                        <div className={`relative ${containerPaddingClass} ${videoWidthClass}`}>
                            <VideoFeedPlayer
                                video={video}
                                isSoundEnabled={isSoundEnabled}
                                videoRef={(el) => {
                                    videoRefs.current[index] = el;
                                    if (el) el.muted = !isSoundEnabled;
                                }}
                            />
                            <SideControlBar controlsBottomClass={controlsBottomClass} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
