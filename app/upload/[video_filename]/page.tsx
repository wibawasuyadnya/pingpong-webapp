"use server";
import Layout from "@/components/Layout";
import Section from "./_components/Section";
import { SessionData } from "@/types/type";
import { getSessionUser } from "@/lib/getUserSession";

export default async function VideoPost({
    params,
    searchParams,
}: {
    params: Promise<{ video_filename: string }>;
    searchParams: Promise<{ post?: string }>;
}) {
    const session: SessionData = await getSessionUser();
    const { video_filename } = await params;
    const postType = (await searchParams)?.post;
    return (
        <div className="bg-[url('/assets/bg-pingpong.webp')] h-auto">
            <Layout>
                <Section videoFilename={video_filename} post={postType} session={session}/>
            </Layout>
        </div>
    );
}
