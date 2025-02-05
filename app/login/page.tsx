"use server"
import Layout from "@/components/Layout";
import Section from "./_components/Section";

export default async function Login() {
    return (
        <Layout type="login">
            <Section />
        </Layout>
    );
}
