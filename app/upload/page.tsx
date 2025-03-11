// app/upload/page.tsx
"use server";
import Layout from "@/components/Layout";
import Section from "./_components/Section";
import { SessionData } from "@/types/type";
import { getSessionUser } from "@/lib/getUserSession";

export default async function Upload(
  {
    searchParams
  }: {
    searchParams:
    Promise<{ reply_video?: string }>
  }) {
  const replyVideo = (await searchParams)?.reply_video;
  return (
    <div className="bg-[url('/assets/bg-pingpong.webp')]">
      <Layout>
        <Section replyVideo={replyVideo} />
      </Layout>
    </div>
  );
}