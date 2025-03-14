"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { SessionData, Video } from "@/types/type";
import getHeader from "@/lib/getHeader";
import { apiUrl } from "@/utils/envConfig";
import VideoFeed from "./Section-Components/VideoFeed";
import { useParams } from "next/navigation";

interface SectionProps {
    session: SessionData;
}

/** Simple throttle utility to prevent spamming loadMore. */
function throttle<T extends (...args: any[]) => void>(func: T, limit: number) {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

export default function Section({ session }: SectionProps) {
    const { videoId } = useParams();
    // If it's a string array, pick the first item; else if it's a string, use it; else undefined
    const currentVideoId = Array.isArray(videoId) ? videoId[0] : videoId;

    const [videos, setVideos] = useState<Video[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    /**
     * Fetch a given page of videos in the thread `currentVideoId`.
     * This returns an object with `data` (the videos) and `meta` for pagination.
     */
    const fetchVideos = useCallback(
        async (page: number) => {
            try {
                const headers = await getHeader({ user: session.user });
                const res = await fetch(`${apiUrl}/api/thread/${currentVideoId}?page=${page}&limit=10`, {
                    headers,
                });
                const data = await res.json();

                if (data?.data && data.data.length > 0) {
                    setVideos((prev) => {
                        // Filter out duplicates
                        const newVideos = data.data.filter(
                            (newVideo: Video) => !prev.some((v) => v.id === newVideo.id)
                        );
                        return [...prev, ...newVideos];
                    });

                    // If page < last_page, there's more to load
                    setHasMore(page < data.meta.last_page);
                } else {
                    setHasMore(false);
                }
            } catch (error) {
                console.error("Error fetching videos:", error);
                setHasMore(false);
            }
        },
        [session, currentVideoId]
    );

    /**
     * On mount (or when session changes), load page 1 for this thread.
     */
    useEffect(() => {
        if (!session) return;
        if (!currentVideoId) return; // If there's no videoId param, do nothing

        (async () => {
            setIsInitialLoading(true);
            setVideos([]);
            setCurrentPage(1);

            await fetchVideos(1);
            setIsInitialLoading(false);
        })();
    }, [session, currentVideoId, fetchVideos]);

    /**
     * Called by VideoFeed or scroll logic to load the next page.
     */
    const loadMoreVideos = useCallback(async () => {
        // Don’t load if we’re still doing the initial load, already loading, or no more pages
        if (isInitialLoading || loadingMore || !hasMore) return;

        setLoadingMore(true);
        const nextPage = currentPage + 1;
        await fetchVideos(nextPage);
        setCurrentPage(nextPage);
        setLoadingMore(false);
    }, [isInitialLoading, loadingMore, hasMore, currentPage, fetchVideos]);

    /**
     * Throttled version of loadMoreVideos (1s).
     */
    const throttledLoadMore = useMemo(
        () => throttle(loadMoreVideos, 1000),
        [loadMoreVideos]
    );

    return (
        <div className="overflow-hidden no-scrollbar">
            <VideoFeed
                videos={videos}
                loadMore={throttledLoadMore}
                hasMore={hasMore}
                loadingMore={loadingMore}
                isInitialLoading={isInitialLoading}
                currentVideoId={currentVideoId}
            />
        </div>
    );
}
