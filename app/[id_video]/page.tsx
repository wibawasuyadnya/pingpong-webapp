"use server"
import Layout from "@/components/Layout";
import Section from "./_components/Section";
import { getSessionUser } from "@/lib/getUserSession";
import { SessionData } from "@/types/type";

export default async function Post() {
    const session: SessionData = await getSessionUser();
    return (
        <div className="bg-[url('/assets/bg-pingpong.webp')] h-screen overflow-hidden">
            <Layout>
                <Section session={session} />
            </Layout>
        </div>
    );
}

