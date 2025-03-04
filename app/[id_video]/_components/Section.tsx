"use client";
import React, { useState, useEffect, useRef } from "react";
import VideoFeed from "./Section-Components/VideoFeed";
import { SessionData } from "@/types/type";
import getHeader from "@/lib/getHeader";
import { apiUrl } from "@/utils/envConfig";

interface VideoSource {
    id: string;
    source: string;
    orientation: string;
    authorName?: string;
    authorProfilePicture?: string;
    description?: string;
    isHls?: boolean;
}

interface SectionProps {
    session: SessionData;
    initialVideos: any[];
    idVideo: string;
}

export default function Section({ session, initialVideos, idVideo }: SectionProps) {
    const [videos, setVideos] = useState<VideoSource[]>(
        initialVideos
            .map(mapApiVideoToSource)
            .filter((video: VideoSource | null): video is VideoSource => video !== null) // Explicit input type
    );
    const [page, setPage] = useState(2);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef<HTMLDivElement>(null);

    function mapApiVideoToSource(apiVideo: any): VideoSource | null {
        const source = apiVideo.hls_url && apiVideo.hls_url !== "" ? apiVideo.hls_url : apiVideo.video_url;
        if (!source || source === "") return null;

        return {
            id: apiVideo.id,
            source,
            orientation: apiVideo.is_front_camera ? "portrait" : "landscape",
            authorName: apiVideo.user?.username || "Unknown",
            authorProfilePicture: apiVideo.user?.profile_picture || "",
            description: apiVideo.title || apiVideo.thread_name,
            isHls: !!(apiVideo.hls_url && apiVideo.hls_url !== ""),
        };
    }

    const fetchMoreVideos = async () => {
        const headers = await getHeader({ user: session.user });
        const params = new URLSearchParams({
            page: page.toString(),
            limit: "10",
        });

        const res = await fetch(`${apiUrl}/api/video?${params.toString()}`, {
            method: "GET",
            headers,
        });

        if (!res.ok) {
            console.error("Failed to fetch more videos");
            setHasMore(false);
            return;
        }

        const data = await res.json();
        const newVideos = data.data
            .map(mapApiVideoToSource)
            .filter((video: VideoSource | null): video is VideoSource => video !== null); // Explicit input type

        setVideos((prevVideos) => {
            const existingIds = new Set(prevVideos.map((v) => v.id));
            const uniqueNewVideos = newVideos.filter((video: VideoSource) => !existingIds.has(video.id));
            return [...prevVideos, ...uniqueNewVideos];
        });
        setPage((prevPage) => prevPage + 1);
        setHasMore(data.meta.current_page < data.meta.last_page);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    fetchMoreVideos();
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [page, hasMore]);

    return (
        <div className="h-screen overflow-hidden no-scrollbar">
            <VideoFeed sources={videos} initialVideoId={idVideo} />
            {hasMore && (
                <div ref={loaderRef} className="h-10 flex items-center justify-center">
                    Loading more...
                </div>
            )}
        </div>
    );
}