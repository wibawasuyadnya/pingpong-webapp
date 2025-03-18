"use server"
import Layout from "@/components/Layout";
import Section from "./_components/Section";

export default async function Login() {
    return (
        <div className="bg-[url('/assets/bg-pingpong.webp')] bg-cover h-screen overflow-hidden">
            <Layout type="login">
                <Section />
            </Layout>
        </div>
    );
}
