// app/thread/[videoId]/page.tsx
'use server';
import Layout from '@/components/Layout';
import Section from './_components/Section';
import React from 'react';
import { SessionData } from '@/types/type';
import { getSessionUser } from '@/lib/getUserSession';

export default async function Thread() {
    const session: SessionData = await getSessionUser();
    return (
        <div className="bg-[url('/assets/bg-pingpong.webp')]">
            <Layout session={session}>
                <Section session={session} />
            </Layout>
        </div>
    );
}