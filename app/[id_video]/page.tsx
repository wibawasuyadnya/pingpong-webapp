"use server"
import Layout from "@/components/Layout";
import Section from "./_components/Section";

export default async function Post() {
    return (
        <div className="bg-[url('/assets/bg-pingpong.webp')] h-screen overflow-hidden">
            <Layout>
                <Section />
            </Layout>
        </div>
    );
}

