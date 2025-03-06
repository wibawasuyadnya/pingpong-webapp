'use client';
import { useRouter, useParams } from 'next/navigation';
import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { Video } from '@/types/type';
import SideControlBar from './VideoFeed-Components/SideControlBar';
import VideoPlayer from './VideoFeed-Components/VideoPlayer';
import NavigationArrows from './VideoFeed-Components/NavigatorArrow';

interface VideoFeedProps {
    videos: Video[];
    loadMore: () => void;
    hasMore: boolean;
}

export default function VideoFeed({ videos, loadMore, hasMore }: VideoFeedProps) {
    const { id_video } = useParams();
    const currentVideoId =
        typeof id_video === 'string'
            ? id_video
            : Array.isArray(id_video)
                ? id_video[0]
                : undefined;

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollPositionRef = useRef<number>(0);

    // New state to track active video index
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Memoize unique videos
    const uniqueVideos = useMemo(() => {
        const seenIds = new Set();
        return videos.filter((video) => {
            if (seenIds.has(video.id)) return false;
            seenIds.add(video.id);
            return true;
        });
    }, [videos]);

    // Intersection Observer to pause videos not in view (remains unchanged)
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
    }, [uniqueVideos]);

    // Scroll handling: update active index and URL
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        scrollPositionRef.current = container.scrollTop;

        timeoutRef.current = setTimeout(() => {
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

            // Update active index state
            setActiveIndex(closestIndex);

            const activeVideo = videoRefs.current[closestIndex];
            if (activeVideo && !activeVideo.classList.contains('active-video')) {
                videoRefs.current.forEach((video) => video?.classList.remove('active-video'));
                activeVideo.classList.add('active-video');
                activeVideo.scrollIntoView({ behavior: 'smooth' });
                if (activeVideo.paused) {
                    activeVideo.play().catch((err) => console.warn('Play interrupted:', err));
                }
            }

            if (uniqueVideos[closestIndex]) {
                const newId = uniqueVideos[closestIndex].id;
                if (currentVideoId !== newId) {
                    // Use the native History API to update the URL without re-rendering
                    window.history.replaceState(window.history.state, '', `/${newId}`);
                }
            }

            if (hasMore) {
                const threshold = 200;
                if (container.scrollTop + container.clientHeight >= container.scrollHeight - threshold) {
                    loadMore();
                }
            }
        }, 150);
    }, [uniqueVideos, currentVideoId, loadMore, hasMore]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [handleScroll]);

    // On initial load or URL change, scroll to the active video
    useEffect(() => {
        const activeIdx = uniqueVideos.findIndex((video) => video.id === currentVideoId);
        if (activeIdx === -1 && hasMore) {
            loadMore();
            return;
        }
        if (activeIdx >= 0 && videoRefs.current[activeIdx]) {
            setActiveIndex(activeIdx);
            const activeVideo = videoRefs.current[activeIdx];
            activeVideo.scrollIntoView({ behavior: 'auto' });
            if (activeVideo.paused) {
                activeVideo.play().catch((err) => console.warn('Play interrupted:', err));
            }
            videoRefs.current.forEach((video, idx) => {
                if (video && idx !== activeIdx && !video.paused) {
                    video.pause();
                }
            });
        }
    }, [currentVideoId, uniqueVideos, hasMore, loadMore]);

    // Restore scroll position after videos update
    useEffect(() => {
        const container = containerRef.current;
        if (container && scrollPositionRef.current) {
            container.scrollTop = scrollPositionRef.current;
        }
    }, [uniqueVideos]);

    // Handlers for arrow navigation
    const handleUpClick = () => {
        if (activeIndex !== null && activeIndex > 0) {
            const newIndex = activeIndex - 1;
            const videoEl = videoRefs.current[newIndex];
            if (videoEl) {
                videoEl.scrollIntoView({ behavior: 'smooth' });
                // Update URL using native History API
                window.history.replaceState(window.history.state, '', `/${uniqueVideos[newIndex].id}`);
                setActiveIndex(newIndex);
            }
        }
    };

    const handleDownClick = () => {
        if (activeIndex !== null && activeIndex < uniqueVideos.length - 1) {
            const newIndex = activeIndex + 1;
            const videoEl = videoRefs.current[newIndex];
            if (videoEl) {
                videoEl.scrollIntoView({ behavior: 'smooth' });
                // Update URL using native History API
                window.history.replaceState(window.history.state, '', `/${uniqueVideos[newIndex].id}`);
                setActiveIndex(newIndex);
            }
        }
    };

    return (
        <>
            <div
                ref={containerRef}
                className="h-[650px] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
                style={{ overscrollBehavior: 'contain' }}
            >
                {uniqueVideos.map((video, index) => {
                    const containerPaddingClass = 'p-4';
                    const controlsBottomClass = 'bottom-5 -right-13';
                    return (
                        <div
                            key={`${video.id}-${index}`}
                            className={`relative h-[650px] w-full flex items-center justify-center snap-start ${index > 0 ? 'mt-[10px]' : ''}`}
                            style={{ scrollSnapStop: 'always' }}
                        >
                            <div className={`relative ${containerPaddingClass} w-full max-w-[350px]`}>
                                <VideoPlayer
                                    video={{
                                        id: video.id,
                                        source: video.hls_url || video.video_url,
                                        orientation: 'landscape',
                                        authorName: video.user.name,
                                        authorProfilePicture: video.user.picture,
                                        description: video.title,
                                    }}
                                    videoRef={(el) => (videoRefs.current[index] = el)}
                                    isSoundEnabled={true}
                                />
                                <SideControlBar controlsBottomClass={controlsBottomClass} />
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Render navigation arrows */}
            <NavigationArrows
                onUpClick={handleUpClick}
                onDownClick={handleDownClick}
                totalVideos={uniqueVideos.length}
                currentIndex={activeIndex}
            />
        </>
    );
}
