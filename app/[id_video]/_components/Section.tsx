'use client';
import React, { useEffect, useState, useCallback, memo } from 'react';
import { SessionData, Video } from '@/types/type';
import { useDecryptedUserHook } from '@/hook/useDecryptedUser';
import getHeaderClientSide from '@/lib/getHeaderClientSide';
import { apiUrl } from '@/utils/envConfig';
import VideoFeed from './Section-Components/VideoFeed';

function Section() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [session, setSession] = useState<SessionData>({ isLoggedIn: false, user: null });
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const decryptedUser = useDecryptedUserHook(session.user);

    // Fetch session data
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch('/api/auth/user', { credentials: 'include' });
                const data: SessionData = await response.json();
                setSession(data);
            } catch (error) {
                console.error('Error fetching session:', error);
                setSession({ isLoggedIn: false, user: null });
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchSession();
    }, []);

    const fetchVideos = useCallback(
        async (page: number) => {
            try {
                const headers = await getHeaderClientSide({ user: decryptedUser });
                const res = await fetch(`${apiUrl}/api/video?page=${page}&limit=10`, { headers });
                const data = await res.json();
                if (data?.data && data.data.length > 0) {
                    setVideos((prev) => {
                        const newVideos = data.data.filter((newVideo: Video) => !prev.some((v) => v.id === newVideo.id));
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
        [decryptedUser]
    );

    // Initial load: page 1
    useEffect(() => {
        if (decryptedUser && isInitialLoading === false) {
            setVideos([]);
            setCurrentPage(1);
            fetchVideos(1);
        }
    }, [decryptedUser, fetchVideos, isInitialLoading]);

    // Load more function (throttled)
    const loadMoreVideos = useCallback(
        throttle(async () => {
            if (!hasMore || loadingMore) return;
            setLoadingMore(true);
            const nextPage = currentPage + 1;
            await fetchVideos(nextPage);
            setCurrentPage(nextPage);
            setLoadingMore(false);
        }, 1000), // Throttle to 1 request per second
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

// Simple throttle implementation
function throttle(func: (...args: any[]) => void, limit: number) {
    let inThrottle: boolean;
    return function (...args: any[]) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

export default memo(Section);