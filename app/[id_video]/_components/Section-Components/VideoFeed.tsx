'use client';
import { useRouter, usePathname } from 'next/navigation';
import VideoFeedPlayer from './VideoFeed-Components/VideoPlayer';
import SideControlBar from './VideoFeed-Components/SideControlBar';
import NavigationArrows from './VideoFeed-Components/NavigatorArrow';
import React, { useRef, useEffect, useState, useCallback } from 'react';

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
    const [isSoundEnabled] = useState(true);
    const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(0); // Start at 0
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const GAP = 8; // Gap between videos

    // Ensure only one video plays at a time
    const playActiveVideo = useCallback((index: number) => {
        videoRefs.current.forEach((video, i) => {
            if (video) {
                if (i === index && document.visibilityState === 'visible' && video.paused) {
                    video.play().catch((err) => console.warn("Play interrupted:", err.message));
                } else if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, []);

    // Intersection Observer: Preload and pause videos based on visibility
    useEffect(() => {
        const options = { rootMargin: '200px', threshold: 0.1 };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                const video = entry.target as HTMLVideoElement;
                if (entry.isIntersecting) {
                    if (video.preload !== 'auto') {
                        video.preload = 'auto';
                    }
                } else if (!video.paused) {
                    video.pause();
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);
        videoRefs.current.forEach((video) => video && observer.observe(video));

        return () => videoRefs.current.forEach((video) => video && observer.unobserve(video));
    }, []);

    // Navigate to a specific video index
    const navigateToVideo = useCallback((index: number) => {
        if (index < 0 || index >= sources.length || !containerRef.current) return;

        setIsTransitioning(true);
        videoRefs.current.forEach((video) => video?.pause());

        const activeVideo = videoRefs.current[index];
        if (activeVideo) {
            videoRefs.current.forEach((video, i) => {
                if (video && i !== index) {
                    video.classList.remove('active-video');
                }
            });

            if (!activeVideo.classList.contains('active-video')) {
                activeVideo.classList.add('active-video');
                const targetScrollTop = index * (650 + GAP);
                containerRef.current.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
            }

            const newPath = `/${sources[index].id}`;
            if (pathname !== newPath) {
                console.log('Appending URL:', newPath);
                router.replace(newPath, { scroll: false });
            }

            setTimeout(() => {
                playActiveVideo(index);
                setActiveVideoIndex(index);
                setIsTransitioning(false);
            }, 300);
        } else {
            setIsTransitioning(false);
        }
    }, [sources, pathname, router, playActiveVideo]);

    // Handle arrow navigation
    const handleUpClick = () => {
        if (activeVideoIndex !== null && activeVideoIndex > 0) {
            navigateToVideo(activeVideoIndex - 1);
        }
    };

    const handleDownClick = () => {
        if (activeVideoIndex !== null && activeVideoIndex < sources.length - 1) {
            navigateToVideo(activeVideoIndex + 1);
        }
    };

    // Play the active video when the URL (pathname) changes
    useEffect(() => {
        const currentId = pathname.replace('/', '');
        const activeIndex = sources.findIndex((video) => video.id === currentId);

        if (activeIndex >= 0 && activeIndex !== activeVideoIndex) {
            navigateToVideo(activeIndex);
        }
    }, [pathname, sources, activeVideoIndex, navigateToVideo]);

    // Handle visibility change (pause/resume based on page focus)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                if (activeVideoIndex !== null) {
                    const activeVideo = videoRefs.current[activeVideoIndex];
                    if (activeVideo && !activeVideo.paused) {
                        activeVideo.pause();
                    }
                }
            } else if (document.visibilityState === 'visible' && !isTransitioning) {
                if (activeVideoIndex !== null) {
                    playActiveVideo(activeVideoIndex);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [activeVideoIndex, isTransitioning, playActiveVideo]);

    return (
        <div className="relative h-[650px]">
            <div
                ref={containerRef}
                className="h-[650px] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
                style={{ overscrollBehavior: 'cover' }}
            >
                {sources.map((video, index) => {
                    const videoWidthClass = video.orientation === 'portrait' ? 'w-[350px]' : 'w-[800px]';
                    const containerPaddingClass = video.orientation === 'landscape' ? 'p-4' : '';
                    const controlsBottomClass = video.orientation === 'portrait' ? 'bottom-0 -right-16' : 'bottom-5 -right-13';

                    return (
                        <div
                            key={video.id}
                            className={`relative h-[650px] w-full flex items-center justify-center snap-start ${index > 0 ? 'mt-[8px]' : ''}`}
                            style={{ scrollSnapStop: 'always' }}
                        >
                            <div className={`relative ${containerPaddingClass} ${videoWidthClass}`}>
                                <VideoFeedPlayer
                                    video={video}
                                    isSoundEnabled={isSoundEnabled}
                                    videoRef={(el) => {
                                        if (el) el.dataset.index = index.toString();
                                        videoRefs.current[index] = el;
                                    }}
                                    isTransitioning={isTransitioning && activeVideoIndex !== index}
                                />
                                <SideControlBar controlsBottomClass={controlsBottomClass} />
                            </div>
                        </div>
                    );
                })}
            </div>
            <NavigationArrows
                onUpClick={handleUpClick}
                onDownClick={handleDownClick}
                totalVideos={sources.length}
                currentIndex={activeVideoIndex}
            />
        </div>
    );
}