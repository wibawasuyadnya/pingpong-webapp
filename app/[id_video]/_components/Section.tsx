'use client';
import React from 'react';
import VideoFeed from './Section-Components/VideoFeed';
import { SessionData } from '@/types/type';

const videoSources = [
    {
        id: "1",
        source: "/video/video_list_1.mp4",
        orientation: "portrait",
        authorName: "Kadek Kolot Bolot",
        authorProfilePicture: "",
        description: "Coba benerin colokan listrik, malah meledak. Sekarang rambut kayak landak. 🔥⚡",
    },
    {
        id: "2",
        source: '/video/video_list_2.mp4',
        orientation: 'landscape',
        authorName: "Iwan Tolol Gigi Kosong",
        authorProfilePicture: "",
        description: "Beli odol buat ngisi gigi bolong, malah ketipu odol rasa keju. Sekarang nyengir kaya orang buduh.",
    },
    {
        id: "3",
        source: '/video/video_list_3.mp4',
        orientation: 'landscape',
        authorName: "Eric Raja Boncos",
        authorProfilePicture: "",
        description: "Gara-gara dia gua rugi 300 ribu, makan mie instan 3 minggu anjing.",
    },
    {
        id: "4",
        source: '/video/video_list_4.mp4',
        orientation: 'portrait',
        authorName: "Ka Agus Kelaparan",
        authorProfilePicture: "",
        description: "Ka Victor maling roti gua, sekarang gua makan angin.",
    },
    {
        id: "5",
        source: '/video/video_list_5.mp4',
        orientation: 'portrait',
        authorName: "Ka Victor Sang Pencuri Roti",
        authorProfilePicture: "",
        description: "Bukan gua yang maling roti, tangan gua tiba-tiba nyelonong sendiri! 🥖",
    },
    {
        id: "6",
        source: "/video/video_list_6.mp4",
        orientation: "portrait",
        authorName: "Sugeng raja guyon",
        authorProfilePicture: "",
        description: "sugeng kangen cangar memutar otak keras menjabarkan cerita keingannya untuk mengunjungi cangar",
    },
    {
        id: "7",
        source: "/video/video_list_7.mp4",
        orientation: "landscape",
        authorName: "Iwan Bego",
        authorProfilePicture: "",
        description: "Nonton film horor, tapi yang bikin takut malah bayangan sendiri. Malam itu gua gak tidur semalaman.",
    },
    {
        id: "8",
        source: "/video/video_list_8.mp4",
        orientation: "portrait",
        authorName: "Eric Si Tukang Ngutang",
        authorProfilePicture: "",
        description: "Minum kopi seharian buat melempar utang, tapi utang malah numpuk. Kopi gua sekarang jadi modal bayar utang.",
    },
    {
        id: "9",
        source: "/video/video_list_9.mp4",
        orientation: "portrait",
        authorName: "Ka Ucup Si Pemalas",
        authorProfilePicture: "",
        description: "Mau olahraga, tapi malas gerak. Akhirnya, kursi gua jadi teman setia buat tidur siang.",
    },
    {
        id: "10",
        source: "/video/video_list_10.mp4",
        orientation: "portrait",
        authorName: "Iwan Si Kocak",
        authorProfilePicture: "",
        description: "Ngopi bareng teman, gua malah cerita lawak. Sampai kopi pun tertawa, bener-bener kocak!",
    },
    {
        id: "11",
        source: "/video/video_list_11.mp4",
        orientation: "portrait",
        authorName: "Ka Riko Tukang Becanda",
        authorProfilePicture: "",
        description: "Coba becanda, tapi yang denger malah baper. Sekarang gua dijuluki 'Si Baper'.",
    }
];


export default function Section({ session }: { session: SessionData }) {
    console.log(session);
    return (
        <div className='overflow-hidden no-scrollbar'>
            <VideoFeed sources={videoSources} />
        </div>
    );
}