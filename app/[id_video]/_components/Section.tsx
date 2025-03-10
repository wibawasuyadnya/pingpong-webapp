'use client';
import React, { useEffect, useState, useCallback, memo } from 'react';
import { SessionData, Video } from '@/types/type';
import getHeader from '@/lib/getHeader'; 
import { apiUrl } from '@/utils/envConfig';
import VideoFeed from './Section-Components/VideoFeed';

interface SectionProps {
    session: SessionData;
}

//  throttle
function throttle(func: (...args: any[]) => void, limit: number) {
    let inThrottle = false;
    return function (...args: any[]) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

function Section({ session }: SectionProps) {
    const [videos, setVideos] = useState<Video[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);


    // 2) fetchVideos logic
    const fetchVideos = useCallback(
        async (page: number) => {
            try {
                // Use getHeader now
                const headers = await getHeader({ user: session.user });

                // e.g. fetch from your API
                const res = await fetch(`${apiUrl}/api/video?page=${page}&limit=10`, {
                    headers,
                });
                const data = await res.json();

                if (data?.data && data.data.length > 0) {
                    setVideos((prev) => {
                        const newVideos = data.data.filter(
                            (newVideo: Video) => !prev.some((v) => v.id === newVideo.id)
                        );
                        return [...prev, ...newVideos];
                    });
                    setHasMore(page < data.meta.last_page);
                } else {
                    setHasMore(false);
                }
            } catch (error) {
                console.error('Error fetching videos:', error);
                setHasMore(false);
            }
        },
        [session]
    );

    // 3) On mount, load page 1
    useEffect(() => {
        // We already have session from the server, so no need to fetch session here
        if (session) {
            setVideos([]);
            setCurrentPage(1);
            fetchVideos(1);
        }
        setIsInitialLoading(false);
    }, [session, fetchVideos]);

    // 4) Throttled loadMore
    const loadMoreVideos = useCallback(
        throttle(async () => {
            if (!hasMore || loadingMore) return;
            setLoadingMore(true);
            const nextPage = currentPage + 1;
            await fetchVideos(nextPage);
            setCurrentPage(nextPage);
            setLoadingMore(false);
        }, 1000),
        [currentPage, hasMore, fetchVideos, loadingMore]
    );

    return (
        <div className="overflow-hidden no-scrollbar">
            <VideoFeed
                videos={videos}
                loadMore={loadMoreVideos}
                hasMore={hasMore}
                loadingMore={loadingMore}
                isInitialLoading={isInitialLoading}
            />
        </div>
    );
}

export default memo(Section);
