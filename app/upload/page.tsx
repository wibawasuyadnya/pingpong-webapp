"use server";
import Layout from "@/components/Layout";
import Section from "./_components/Section";

export default async function Upload() {
  return (
    <div className="bg-[url('/assets/bg-pingpong.webp')]">
      <Layout>
        <Section />
      </Layout>
    </div>
  );
}
