// app/[id_video]/page.tsx
'use client';
import Layout from '@/components/Layout';
import Section from './_components/Section';
import React, { memo } from 'react';

const MemoizedSection = memo(Section);

export default function Post() {
  return (
    <div className="bg-[url('/assets/bg-pingpong.webp')] h-screen overflow-hidden">
      <Layout>
        <MemoizedSection />
      </Layout>
    </div>
  );
}