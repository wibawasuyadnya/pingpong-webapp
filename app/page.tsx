"use server"
import Layout from "@/components/Layout";
import Section from "./_components/Section";

export default async function Home() {
  return (
    <div className="bg-[url('/assets/bg-pingpong.webp')] h-screen overflow-hidden">
      <Layout>
        <Section />
      </Layout>
    </div>
  );
}
