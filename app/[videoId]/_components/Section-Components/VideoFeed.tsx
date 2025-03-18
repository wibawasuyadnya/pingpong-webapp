"use client";
import { Video } from "@/types/type";
import { ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import VideoPlayer from "@/components/Layout-Components/VideoFeed-Components/VideoPlayer";
import React, {
    useRef,
    useEffect,
    useMemo,
    useCallback,
    useState,
    Fragment,
} from "react";
import UploadButton from "@/components/Layout-Components/VideoFeed-Components/UploadButton";
import VideoSkeleton from "@/components/Layout-Components/VideoFeed-Components/VideoSkeleton";
import SideControlBar from "@/components/Layout-Components/VideoFeed-Components/SideControlBar";
import NavigationArrows from "@/components/Layout-Components/VideoFeed-Components/NavigatorArrow";
import Link from "next/link";
import FlippingCircleLoader from "@/components/Layout-Components/FlippingCircleLoader";
import useWindowDimensions from "@/hook/useWindowDimensions";

interface VideoFeedProps {
    videos: Video[];
    loadMore: () => void;
    hasMore: boolean;
    loadingMore: boolean;
    isInitialLoading: boolean;
}

export default function VideoFeed({
    videos,
    loadMore,
    hasMore,
    loadingMore,
    isInitialLoading,
}: VideoFeedProps) {
    const { videoId } = useParams();
    const currentVideoId =
        typeof videoId === "string"
            ? videoId
            : Array.isArray(videoId)
                ? videoId[0]
                : undefined;

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollPositionRef = useRef<number>(0);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [hasUserPlayedVideo, setHasUserPlayedVideo] = useState(false);
    const [initialActiveSet, setInitialActiveSet] = useState(false);
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const [pendingPath, setPendingPath] = useState<string | null>(null);
    const orientationMap = useAppSelector((state) => state.orientation?.orientationMap) ?? {};

    useEffect(() => {
        if (pendingPath !== null) {
            window.history.replaceState(
                window.history.state,
                "",
                `/${pendingPath}`
            );
        }
    }, [pendingPath]);


    const uniqueVideos = useMemo(() => {
        const seenIds = new Set();
        return videos.filter((video) => {
            if (seenIds.has(video.id)) return false;
            seenIds.add(video.id);
            return true;
        });
    }, [videos]);

    const isTargetVideoLoaded = currentVideoId
        ? uniqueVideos.some((video) => video.id === currentVideoId)
        : true;

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

        return () => {
            videoRefs.current.forEach((video) => video && observer.unobserve(video));
        };
    }, [uniqueVideos]);

    // Helper to play the newly active video
    const playActiveVideo = useCallback(
        (index: number) => {
            const video = videoRefs.current[index];
            if (!video) return;

            // Pause all other videos
            videoRefs.current.forEach((v, idx) => {
                if (v && idx !== index && !v.paused) {
                    v.pause();
                }
            });

            video.muted = false;
            video
                .play()
                .then(() => console.log(`Playing video at index ${index} with sound`))
                .catch((err) => console.warn("Play interrupted:", err));
        },
        []
    );

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
                    videoRefs.current.forEach((v) => v?.classList.remove("active-video"));
                    activeVideo.classList.add("active-video");

                    if (hasUserPlayedVideo) {
                        playActiveVideo(closestIndex);
                    }
                }

                if (uniqueVideos[closestIndex]) {
                    setPendingPath(uniqueVideos[closestIndex].id);
                }
            }

            if (hasMore) {
                const threshold = 200;
                if (
                    container.scrollTop + container.clientHeight >=
                    container.scrollHeight - threshold
                ) {
                    loadMore();
                }
            }
        }, 150);
    }, [
        uniqueVideos,
        loadMore,
        hasMore,
        activeIndex,
        playActiveVideo,
        hasUserPlayedVideo,
        setPendingPath,
    ]);

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
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
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
                setActiveIndex(newIndex);
                if (hasUserPlayedVideo) {
                    playActiveVideo(newIndex);
                }
                setPendingPath(uniqueVideos[newIndex].id);
            }
        }
    };

    // "Down" arrow button
    const handleDownClick = () => {
        if (activeIndex !== null && activeIndex < uniqueVideos.length - 1) {
            const newIndex = activeIndex + 1;
            const videoEl = videoRefs.current[newIndex];
            if (videoEl) {
                videoEl.scrollIntoView({ behavior: "smooth" });
                setActiveIndex(newIndex);
                if (hasUserPlayedVideo) {
                    playActiveVideo(newIndex);
                }
                setPendingPath(uniqueVideos[newIndex].id);
            }
        }
    };

    function trimThreadName(threadName: string, maxWords = 5): string {
        const words = threadName.split(/\s+/);
        return words.length > maxWords
            ? words.slice(0, maxWords).join(" ") + "..."
            : threadName;
    }

    const renderContent = () => {
        if (
            isInitialLoading ||
            (currentVideoId && !uniqueVideos.some((video) => video.id === currentVideoId))
        ) {
            return (
                <div className="w-full h-[650px] flex items-center justify-center">
                    <FlippingCircleLoader size={80} color="#B14AE2" duration={2} />
                </div>
            );
        }

        const activeVideoId = activeIndex !== null ? uniqueVideos[activeIndex]?.id : undefined;
        const isLandscape = activeVideoId ? orientationMap[activeVideoId] ?? null : null;

        const activeOrientation =
            activeIndex !== null && uniqueVideos[activeIndex]
                ? orientationMap[uniqueVideos[activeIndex].id] ?? null
                : null;

        const computePlayerWidth = () => {
            const offset = 100;
            const dynamicHeight = windowHeight - offset;
            const ratio = activeOrientation ? 16 / 9 : 9 / 16;
            const dynamicWidth = dynamicHeight * ratio;
            const isLargeScreen = windowWidth >= 1280;
            if (isLargeScreen) {
                return activeOrientation ? "60vw" : "25vw";
            }
            return activeOrientation === null ? "385px" : `${dynamicWidth}px`;
        };

        return (
            <Fragment>
                <div
                    className={`absolute ${isLandscape === null ? "top-0" : isLandscape ? "top-10" : "top-0"} right-[-5px] z-20 flex flex-row items-end justify-center`}
                    style={{ width: "calc(100% - 205px)" }}
                >
                    <div
                        className="absolute z-10 flex flex-row justify-center items-center"
                        style={{ width: computePlayerWidth() }}
                    >
                        <div className="flex flex-row justify-between items-center px-3 w-full">
                            <div className="flex flex-row justify-start items-center gap-4">
                                <Link href={`/thread/${activeIndex !== null ? uniqueVideos[activeIndex].id : ""}`} className="cursor-pointer">
                                    <h1 className="font-bold text-base text-white">
                                        {activeIndex !== null ? trimThreadName(uniqueVideos[activeIndex].thread_name) : "Loading..."}
                                    </h1>
                                </Link>
                                <ChevronRight size={24} className="text-white" />
                            </div>
                            <div className="flex flex-row justify-start items-center gap-4">
                                <h2 className="font-bold text-base text-white">Feed</h2>
                                <span className="icon-[material-symbols--circle] text-[#B14AE2] text-sm"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="overflow-y-scroll snap-y snap-mandatory no-scrollbar relative"
                    style={{ overscrollBehavior: "contain", height: "calc(100vh - 130px)" }}
                >
                    {uniqueVideos.map((video, index) => {
                        const controlsBottomClass = `-right-16 bottom-0`;
                        return (
                            <div
                                key={`${video.id}-${index}`}
                                className="relative w-full flex items-center justify-center snap-start gap-3"
                                style={{ scrollSnapStop: "always", height: "calc(100vh - 155px)" }}
                            >
                                <div className={`relative`}>
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
                        className="fixed bottom-[15px] right-0 z-20 flex flex-row items-end justify-center"
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
