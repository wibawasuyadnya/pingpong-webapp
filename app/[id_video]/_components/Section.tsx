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
    const [session, setSession] = useState<SessionData>({ isLoggedIn: false, user: null });

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
            }
        };
        fetchSession();
    }, []);

    // Fetch videos for a given page
    const fetchVideos = useCallback(async (page: number) => {
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
    }, [decryptedUser]);

    // Initial load
    useEffect(() => {
        if (decryptedUser !== null) {
            setVideos([]);
            setCurrentPage(1);
            fetchVideos(1);
        }
    }, [decryptedUser, fetchVideos]);

    // Load more function (infinite scroll)
    const loadMoreVideos = useCallback(async () => {
        if (!hasMore) return;
        const nextPage = currentPage + 1;
        await fetchVideos(nextPage);
        setCurrentPage(nextPage);
    }, [currentPage, hasMore, fetchVideos]);

    return (
        <div className="overflow-hidden no-scrollbar">
            <VideoFeed videos={videos} loadMore={loadMoreVideos} hasMore={hasMore} />
        </div>
    );
}

export default memo(Section);
