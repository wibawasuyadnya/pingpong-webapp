import React from "react";
import { Trash } from 'iconsax-react';


interface VideoAttachTitleProps {
    video_title: string;
    video_size: string;
}

export default function VideoAttachTitle({ video_title, video_size }: VideoAttachTitleProps) {
    return (
        <div className="rounded-lg bg-white p-3">
            <div className="bg-[#F9FFFC] border-[#34C759] border-[1px] border-solid rounded-lg p-3 flex flex-row gap-1">
                <div className="space-y-2 w-full">
                    <h1 className="text-sm font-normal text-black">{video_title}</h1>
                    <div className="flex flex-row gap-3 justify-start items-center">
                        <span className="icon-[akar-icons--circle-check-fill] size-5 text-[#50C878]"></span>
                        <h2 className="text-[#989692] font-normal text-xs uppercase">{video_size} MB</h2>
                    </div>
                </div>
                <div className="flex justify-end items-start w-full">
                    <Trash
                        size="20px"
                        color="#353535"
                    />
                </div>
            </div>
        </div>
    )
}