"use server";
import Layout from "@/components/Layout";
import Section from "./_components/Section";

export default async function VideoPost({
    params,
    searchParams,
}: {
    params: Promise<{ video_filename: string }>;
    searchParams: Promise<{ post?: string }>;
}) {
    const { video_filename } = await params;
    const postType = (await searchParams)?.post;
    return (
        <div className="bg-[url('/assets/bg-pingpong.webp')] h-auto">
            <Layout>
                <Section videoFilename={video_filename} post={postType} />
            </Layout>
        </div>
    );
}
