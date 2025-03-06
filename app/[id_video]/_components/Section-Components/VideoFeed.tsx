'use client';
import { useRouter, useParams } from 'next/navigation';
import React, { useRef, useEffect, useMemo, useCallback, useState, Fragment } from 'react';
import { Video } from '@/types/type';
import SideControlBar from './VideoFeed-Components/SideControlBar';
import VideoPlayer from './VideoFeed-Components/VideoPlayer';
import NavigationArrows from './VideoFeed-Components/NavigatorArrow';
import VideoSkeleton from './VideoFeed-Components/VideoSkeleton';

interface VideoFeedProps {
    videos: Video[];
    loadMore: () => void;
    hasMore: boolean;
    loadingMore: boolean;
    isInitialLoading: boolean;
}

export default function VideoFeed({ videos, loadMore, hasMore, loadingMore, isInitialLoading }: VideoFeedProps) {
    const { id_video } = useParams();
    const currentVideoId =
        typeof id_video === 'string'
            ? id_video
            : Array.isArray(id_video)
                ? id_video[0]
                : undefined;

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollPositionRef = useRef<number>(0);
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

    // Check if the desired video is loaded
    const isTargetVideoLoaded = currentVideoId ? uniqueVideos.some((video) => video.id === currentVideoId) : true;

    // Trigger loadMore if the target video isn’t loaded
    useEffect(() => {
        if (currentVideoId && !isTargetVideoLoaded && hasMore && !loadingMore) {
            loadMore();
        }
    }, [currentVideoId, isTargetVideoLoaded, hasMore, loadingMore, loadMore]);

    // Intersection Observer to pause videos not in view
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

    // On initial load (or URL change), scroll to the active video
    useEffect(() => {
        const activeIdx = uniqueVideos.findIndex((video) => video.id === currentVideoId);
        if (activeIdx >= 0 && videoRefs.current[activeIdx]) {
            setActiveIndex(activeIdx);
            const activeVideo = videoRefs.current[activeIdx];
            activeVideo.scrollIntoView({ behavior: 'auto' });
            if (activeVideo.paused) {
                activeVideo.play().catch((err) => {
                    if (err.name === 'AbortError') {
                        return;
                    }
                    console.error('Play error:', err);
                });
            }
            videoRefs.current.forEach((video, idx) => {
                if (video && idx !== activeIdx && !video.paused) {
                    video.pause();
                }
            });
        }
    }, [currentVideoId, uniqueVideos]);

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
                window.history.replaceState(window.history.state, '', `/${uniqueVideos[newIndex].id}`);
                setActiveIndex(newIndex);
            }
        }
    };

    // Render logic
    const renderContent = () => {
        if (isInitialLoading || (currentVideoId && !isTargetVideoLoaded)) {
            return (
                <div className="w-full h-[650px] flex items-center justify-center">
                    <VideoSkeleton />
                </div>
            );
        }

        return (
            <Fragment>
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
                                className={`relative h-[650px] w-full flex items-center justify-center snap-start ${index > 0 ? 'mt-[20px]' : ''}`}
                                style={{ scrollSnapStop: 'always' }}
                            >
                                <div className={`relative ${containerPaddingClass} w-full max-w-[400px]`}>
                                    <VideoPlayer
                                        video={{
                                            id: video.id,
                                            source: video.hls_url || video.video_url,
                                            orientation: 'landscape',
                                            authorName: video.user.name,
                                            authorProfilePicture: video.user.picture,
                                            description: video.srt_file,
                                        }}
                                        videoRef={(el) => (videoRefs.current[index] = el)}
                                        isSoundEnabled={true}
                                    />
                                    <SideControlBar controlsBottomClass={controlsBottomClass} />
                                </div>
                            </div>
                        );
                    })}
                    {loadingMore && (
                        <div className="flex items-center justify-center p-4">
                            <VideoSkeleton />
                        </div>
                    )}
                </div>
                <NavigationArrows
                    onUpClick={handleUpClick}
                    onDownClick={handleDownClick}
                    totalVideos={uniqueVideos.length}
                    currentIndex={activeIndex}
                />
            </Fragment>
        );
    };

    return <Fragment>{renderContent()}</Fragment>;
}