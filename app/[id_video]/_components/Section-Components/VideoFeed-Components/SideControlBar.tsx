import { Bookmark, MessageSquareText, ThumbsUp } from "lucide-react";
import React from "react";

export default function SideControlBar({
    controlsBottomClass
}: { controlsBottomClass: string }) {
    return (
        <div className={`absolute ${controlsBottomClass} z-10 flex flex-col items-center space-y-4`}>
            <button className="bg-black bg-opacity-50 p-3 rounded-full text-white">
                <ThumbsUp size={20} />
            </button>
            <button className="bg-black bg-opacity-50 p-3 rounded-full text-white">
                <MessageSquareText size={20} />
            </button>
            <button className="bg-black bg-opacity-50 p-3 rounded-full text-white">
                <Bookmark size={20} />
            </button>
        </div>
    )
}