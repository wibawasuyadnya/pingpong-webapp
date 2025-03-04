"use server";
import Layout from "@/components/Layout";
import Section from "./_components/Section";
import { getSessionUser } from "@/lib/getUserSession";
import { SessionData } from "@/types/type";
import getHeader from "@/lib/getHeader";
import { apiUrl } from "@/utils/envConfig";

interface ApiVideo {
    id: string;
    thread_name: string;
    title: string;
    user: { [key: string]: any };
    video_url: string;
    created_at: string;
    is_favorite: boolean;
    is_reply_video: boolean;
    is_front_camera: boolean;
    is_from_gallery: boolean;
    is_draft: boolean;
    is_own_video: boolean;
    is_thread_owner_video: boolean;
    has_srt: boolean;
    srt_file: string;
    total_comment: number;
    duration: string;
    my_emoji_reaction: string;
    my_watch_duration: string;
    is_reminder_active: boolean;
    has_reminders: boolean;
}

async function fetchInitialVideos(session: SessionData): Promise<ApiVideo[]> {
    const headers = await getHeader({ user: session.user });
    const params = new URLSearchParams({
        page: "1",
        limit: "10", 
    });

    const res = await fetch(`${apiUrl}/api/video?${params.toString()}`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch initial video list");
    }

    const data = await res.json();
    return data.data;
}

export default async function Post({ params }: { params: { id_video: string } }) {
    const session: SessionData = await getSessionUser();
    const initialVideos = await fetchInitialVideos(session);

    return (
        <div className="bg-[url('/assets/bg-pingpong.webp')] h-screen overflow-hidden">
            <Layout>
                <Section session={session} initialVideos={initialVideos} idVideo={params.id_video} />
            </Layout>
        </div>
    );
}