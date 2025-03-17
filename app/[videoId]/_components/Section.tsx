"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { SessionData, Video } from "@/types/type";
import getHeader from "@/lib/getHeader";
import { apiUrl } from "@/utils/envConfig";
import VideoFeed from "./Section-Components/VideoFeed";

interface SectionProps {
    session: SessionData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const [videos, setVideos] = useState<Video[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const fetchVideos = useCallback(
        async (page: number) => {
            try {
                const headers = await getHeader({ user: session.user });
                const res = await fetch(`${apiUrl}/api/video?page=${page}&limit=10`, {
                    headers,
                });
                const data = await res.json();

                if (data?.data && data.data.length > 0) {
                    setVideos((prev) => {
                        // Avoid duplicates
                        const newVideos = data.data.filter(
                            (newVideo: Video) => !prev.some((v) => v.id === newVideo.id)
                        );
                        return [...prev, ...newVideos];
                    });

                    // If our current page is less than the last page, we have more
                    setHasMore(page < data.meta.last_page);
                } else {
                    setHasMore(false);
                }
            } catch (error) {
                console.error("Error fetching videos:", error);
                setHasMore(false);
            }
        },
        [session]
    );


    useEffect(() => {
        if (!session) return;

        (async () => {
            setIsInitialLoading(true);
            setVideos([]);
            setCurrentPage(1);

            await fetchVideos(1);
            setIsInitialLoading(false);
        })();
    }, [session, fetchVideos]);

    const loadMoreVideos = useCallback(async () => {
        // Don’t load more if:
        // - initial load is still happening
        // - we’re already loading more
        // - no more pages exist
        if (isInitialLoading || loadingMore || !hasMore) return;

        setLoadingMore(true);
        const nextPage = currentPage + 1;
        await fetchVideos(nextPage);
        setCurrentPage(nextPage);
        setLoadingMore(false);
    }, [isInitialLoading, loadingMore, hasMore, currentPage, fetchVideos]);

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
            />
        </div>
    );
}
