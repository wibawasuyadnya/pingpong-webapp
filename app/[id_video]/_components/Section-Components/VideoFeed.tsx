"use client";
import { useRouter, usePathname } from "next/navigation";
import VideoFeedPlayer from "./VideoFeed-Components/VideoPlayer";
import SideControlBar from "./VideoFeed-Components/SideControlBar";
import React, { useRef, useEffect, useState } from "react";

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
    initialVideoId?: string;
}

export default function VideoFeed({ sources, initialVideoId }: VideoFeedProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const GAP = 8;

    // Play the active video and pause others
    const playActiveVideo = (index: number) => {
        videoRefs.current.forEach((video, i) => {
            if (video) {
                if (i === index && document.visibilityState === "visible" && video.paused) {
                    video.play().catch((err) => console.warn("Play interrupted:", err.message));
                } else if (!video.paused) {
                    video.pause();
                }
            }
        });
    };

    // Scroll to and set active video
    const setVideoFocus = (index: number) => {
        if (index < 0 || index >= sources.length || !containerRef.current) return;

        const activeVideo = videoRefs.current[index];
        if (activeVideo) {
            const targetScrollTop = index * (650 + GAP);
            containerRef.current.scrollTo({ top: targetScrollTop, behavior: "smooth" });
            setActiveVideoIndex(index);
            playActiveVideo(index);

            const newPath = `/${sources[index].id}`;
            if (pathname !== newPath) {
                router.replace(newPath, { scroll: false });
            }
        }
    };

    // Detect active video on scroll
    useEffect(() => {
        const options = {
            root: containerRef.current,
            rootMargin: "0px",
            threshold: 0.8, // 80% visibility to consider it active
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const video = entry.target as HTMLVideoElement;
                    const index = parseInt(video.dataset.index || "0", 10);
                    if (index !== activeVideoIndex) {
                        setActiveVideoIndex(index);
                        playActiveVideo(index);
                        const newPath = `/${sources[index].id}`;
                        if (pathname !== newPath) {
                            router.replace(newPath, { scroll: false });
                        }
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);
        videoRefs.current.forEach((video) => video && observer.observe(video));

        return () => videoRefs.current.forEach((video) => video && observer.unobserve(video));
    }, [sources, activeVideoIndex, pathname, router]);

    // Set initial video focus
    useEffect(() => {
        if (initialVideoId) {
            const index = sources.findIndex((video) => video.id === initialVideoId);
            if (index >= 0 && index !== activeVideoIndex) {
                setVideoFocus(index);
            } else if (index === -1 && sources.length > 0) {
                setVideoFocus(0); // Fallback
            }
        } else if (sources.length > 0 && activeVideoIndex === null) {
            setVideoFocus(0);
        }
    }, [initialVideoId, sources, activeVideoIndex]);

    return (
        <div className="relative h-[650px]">
            <div
                ref={containerRef}
                className="h-[650px] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
                style={{ overscrollBehavior: "cover" }}
            >
                {sources.map((video, index) => {
                    const videoWidthClass = video.orientation === "portrait" ? "w-[350px]" : "w-[800px]";
                    const containerPaddingClass = video.orientation === "landscape" ? "p-4" : "";
                    const controlsBottomClass = video.orientation === "portrait" ? "bottom-0 -right-16" : "bottom-5 -right-13";

                    return (
                        <div
                            key={video.id}
                            className={`relative h-[650px] w-full flex items-center justify-center snap-start ${index > 0 ? "mt-[8px]" : ""
                                }`}
                            style={{ scrollSnapStop: "always" }}
                        >
                            <div className={`relative ${containerPaddingClass} ${videoWidthClass}`}>
                                <VideoFeedPlayer
                                    video={video}
                                    isSoundEnabled={true} // Simplified for now
                                    videoRef={(el) => {
                                        if (el) el.dataset.index = index.toString();
                                        videoRefs.current[index] = el;
                                    }}
                                    isTransitioning={false} // Simplified
                                />
                                <SideControlBar controlsBottomClass={controlsBottomClass} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}