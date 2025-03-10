// app/[id_video]/_components/Section-Components/VideoFeed.tsx
"use client";
import { Video } from "@/types/type";
import { ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import VideoPlayer from "./VideoFeed-Components/VideoPlayer";
import UploadButton from "./VideoFeed-Components/UploadButton";
import VideoSkeleton from "./VideoFeed-Components/VideoSkeleton";
import SideControlBar from "./VideoFeed-Components/SideControlBar";
import NavigationArrows from "./VideoFeed-Components/NavigatorArrow";
import React, { useRef, useEffect, useMemo, useCallback, useState, Fragment } from "react";
import { useAppSelector } from "@/redux/hook";

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
        typeof id_video === "string"
            ? id_video
            : Array.isArray(id_video)
                ? id_video[0]
                : undefined;

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollPositionRef = useRef<number>(0);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [hasUserPlayedVideo, setHasUserPlayedVideo] = useState(false);
    const [initialActiveSet, setInitialActiveSet] = useState(false);
    const orientationMap = useAppSelector((state) => state.orientation?.orientationMap) ?? {};

    const uniqueVideos = useMemo(() => {
        const seenIds = new Set();
        return videos.filter((video) => {
            if (seenIds.has(video.id)) return false;
            seenIds.add(video.id);
            return true;
        });
    }, [videos]);

    const isTargetVideoLoaded = currentVideoId ? uniqueVideos.some((video) => video.id === currentVideoId) : true;

    useEffect(() => {
        if (currentVideoId && !isTargetVideoLoaded && hasMore && !loadingMore) {
            loadMore();
        }
    }, [currentVideoId, isTargetVideoLoaded, hasMore, loadingMore, loadMore]);

    useEffect(() => {
        const options = { rootMargin: "0px", threshold: 0.5 };
        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                const video = entry.target as HTMLVideoElement;
                if (entry.isIntersecting) {
                    video.preload = "auto";
                } else {
                    video.preload = "none";
                    if (!video.paused) {
                        video.pause();
                    }
                }
            });
        };
        const observer = new IntersectionObserver(handleIntersection, options);
        videoRefs.current.forEach((video) => video && observer.observe(video));
        return () => videoRefs.current.forEach((video) => video && observer.unobserve(video));
    }, [uniqueVideos]);

    const playActiveVideo = useCallback((index: number) => {
        const video = videoRefs.current[index];
        if (!video) return;

        videoRefs.current.forEach((v, idx) => {
            if (v && idx !== index && !v.paused) {
                v.pause();
            }
        });

        video.muted = false;
        video.play()
            .then(() => console.log(`Playing video at index ${index} with sound`))
            .catch((err) => console.warn("Play interrupted:", err));
    }, []);

    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        scrollPositionRef.current = container.scrollTop;

        timeoutRef.current = setTimeout(() => {
            const containerTop = container.getBoundingClientRect().top;
            let closestIndex = 0;
            let minDistance = Infinity;

            if (container.scrollTop === 0) {
                closestIndex = 0;
            } else {
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
            }

            if (activeIndex !== closestIndex) {
                setActiveIndex(closestIndex);
                const activeVideo = videoRefs.current[closestIndex];
                if (activeVideo) {
                    videoRefs.current.forEach((video) => video?.classList.remove("active-video"));
                    activeVideo.classList.add("active-video");
                    if (hasUserPlayedVideo) {
                        playActiveVideo(closestIndex);
                    }
                }
            }

            if (uniqueVideos[closestIndex]) {
                const newId = uniqueVideos[closestIndex].id;
                window.history.replaceState(window.history.state, "", `/${newId}`);
            }

            if (hasMore) {
                const threshold = 200;
                if (container.scrollTop + container.clientHeight >= container.scrollHeight - threshold) {
                    loadMore();
                }
            }
        }, 150);
    }, [uniqueVideos, loadMore, hasMore, activeIndex, playActiveVideo, hasUserPlayedVideo]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                videoRefs.current.forEach((video) => {
                    if (video && !video.paused) {
                        video.pause();
                    }
                });
            } else {
                if (activeIndex !== null && hasUserPlayedVideo) {
                    playActiveVideo(activeIndex);
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [activeIndex, playActiveVideo, hasUserPlayedVideo]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [handleScroll]);

    useEffect(() => {
        if (!initialActiveSet && currentVideoId) {
            const activeIdx = uniqueVideos.findIndex((video) => video.id === currentVideoId);
            if (activeIdx >= 0 && videoRefs.current[activeIdx]) {
                setActiveIndex(activeIdx);
                videoRefs.current[activeIdx].scrollIntoView({ behavior: "auto" });
                setInitialActiveSet(true);
            }
        }
    }, [currentVideoId, uniqueVideos, initialActiveSet]);

    useEffect(() => {
        const container = containerRef.current;
        if (container && scrollPositionRef.current) {
            container.scrollTop = scrollPositionRef.current;
        }
    }, [uniqueVideos]);

    const handleUpClick = () => {
        if (activeIndex !== null && activeIndex > 0) {
            const newIndex = activeIndex - 1;
            const videoEl = videoRefs.current[newIndex];
            if (videoEl) {
                videoEl.scrollIntoView({ behavior: "smooth" });
                window.history.replaceState(window.history.state, "", `/${uniqueVideos[newIndex].id}`);
                setActiveIndex(newIndex);
                if (hasUserPlayedVideo) {
                    playActiveVideo(newIndex);
                }
            }
        }
    };

    const handleDownClick = () => {
        if (activeIndex !== null && activeIndex < uniqueVideos.length - 1) {
            const newIndex = activeIndex + 1;
            const videoEl = videoRefs.current[newIndex];
            if (videoEl) {
                videoEl.scrollIntoView({ behavior: "smooth" });
                window.history.replaceState(window.history.state, "", `/${uniqueVideos[newIndex].id}`);
                setActiveIndex(newIndex);
                if (hasUserPlayedVideo) {
                    playActiveVideo(newIndex);
                }
            }
        }
    };

    function trimThreadName(threadName: string, maxWords = 5): string {
        const words = threadName.split(/\s+/);
        return words.length > maxWords ? words.slice(0, maxWords).join(" ") + "..." : threadName;
    }

    const renderContent = () => {
        if (isInitialLoading || (currentVideoId && !uniqueVideos.some((video) => video.id === currentVideoId))) {
            return (
                <div className="w-full h-[700px] flex items-center justify-center">
                    <VideoSkeleton />
                </div>
            );
        }

        const activeVideoId = activeIndex !== null ? uniqueVideos[activeIndex]?.id : undefined;
        const isLandscape = activeVideoId ? orientationMap[activeVideoId] ?? null : null;

        return (
            <Fragment>
                <div
                    ref={containerRef}
                    className="h-[700px] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative"
                    style={{ overscrollBehavior: "contain" }}
                >
                    <div
                        className={`fixed ${isLandscape === null ? "top-10" : isLandscape ? "top-25" : "top-10"} right-0 z-20 flex flex-row items-end justify-center`}
                        style={{ width: "calc(100% - 203.6px)" }}
                    >
                        <div
                            className={`flex flex-row justify-between items-center px-3 ${isLandscape === null ? "w-[400px]" : isLandscape ? "w-[830px]" : "w-[400px]"}`}
                        >
                            <div className="flex flex-row justify-start items-center gap-4">
                                <h1 className="font-bold text-base text-white">
                                    {activeIndex !== null && uniqueVideos[activeIndex]
                                        ? trimThreadName(uniqueVideos[activeIndex].thread_name)
                                        : "Loading..."}
                                </h1>
                                <ChevronRight size={24} className="text-white" />
                            </div>
                            <div className="flex flex-row justify-start items-center gap-4">
                                <h2 className="font-bold text-base text-white">Feed</h2>
                                <span className="icon-[material-symbols--circle] text-[#B14AE2] text-sm"></span>
                            </div>
                        </div>
                    </div>

                    {uniqueVideos.map((video, index) => {
                        const containerPaddingClass = "p-4";
                        const controlsBottomClass = "bottom-5 -right-10";
                        return (
                            <div
                                key={`${video.id}-${index}`}
                                className={`relative min-h-[650px] w-full flex items-center justify-center snap-start ${index > 0 ? "mt-[50px]" : ""}`}
                                style={{ scrollSnapStop: "always" }}
                            >
                                <div className={`relative ${containerPaddingClass}`}>
                                    <VideoPlayer
                                        video={{
                                            id: video.id,
                                            source: video.hls_url || video.video_url,
                                            authorName: video.user.name,
                                            authorProfilePicture: video.user.picture,
                                            description: video.srt_file,
                                            thread_name: video.thread_name,
                                            createdAt: video.created_at,
                                        }}
                                        videoRef={(el) => (videoRefs.current[index] = el)}
                                        isSoundEnabled={true}
                                        onUserPlay={() => setHasUserPlayedVideo(true)}
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
                {activeIndex !== null && uniqueVideos[activeIndex] && (
                    <div
                        className="fixed bottom-2 right-0 z-20 flex flex-row items-end justify-center"
                        style={{ width: "calc(100% - 203.6px)" }}
                    >
                        <UploadButton activeId={uniqueVideos[activeIndex].id} />
                    </div>
                )}
            </Fragment>
        );
    };

    return <Fragment>{renderContent()}</Fragment>;
}