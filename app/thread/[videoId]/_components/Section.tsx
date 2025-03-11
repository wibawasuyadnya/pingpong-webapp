'use client';
import React, { useEffect, useState, useCallback, memo } from 'react';
import { SessionData, Video } from '@/types/type';
import getHeader from '@/lib/getHeader';
import { apiUrl } from '@/utils/envConfig';
import VideoFeed from './Section-Components/VideoFeed';
import { useParams } from 'next/navigation';

interface SectionProps {
    session: SessionData;
}

//  throttle function ( dipisah di utils)
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
    const { videoId } = useParams();
    const currentVideoId =
        typeof videoId === "string"
            ? videoId
            : Array.isArray(videoId)
                ? videoId[0]
                : undefined;
    const [videos, setVideos] = useState<Video[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

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

    useEffect(() => {
        if (session) {
            setVideos([]);
            setCurrentPage(1);
            fetchVideos(1);
        }
        setIsInitialLoading(false);
    }, [session, fetchVideos]);

    // Throttled loadMore
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
                currentVideoId={currentVideoId}
            />
        </div>
    );
}

export default memo(Section);
