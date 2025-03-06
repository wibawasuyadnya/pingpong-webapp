'use client';
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface NavigationArrowsProps {
    onUpClick: () => void;
    onDownClick: () => void;
    totalVideos: number;
    currentIndex: number | null;
}

const NavigationArrows: React.FC<NavigationArrowsProps> = ({
    onUpClick,
    onDownClick,
    totalVideos,
    currentIndex,
}) => {
    return (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-0 z-20">
            <button
                onClick={onUpClick}
                disabled={currentIndex === null || currentIndex === 0}
                className="pt-2 pb-3 px-2 bg-gray-800 bg-opacity-50 rounded-t-full text-white disabled:opacity-50"
                aria-label="Previous video"
            >
                <ChevronUp size={32} />
            </button>
            <button
                onClick={onDownClick}
                disabled={currentIndex === null || currentIndex === totalVideos - 1}
                className="pb-2 pt-3 px-2 bg-gray-800 bg-opacity-50 rounded-b-full text-white disabled:opacity-50"
                aria-label="Next video"
            >
                <ChevronDown size={32} />
            </button>
        </div>
    );
};

export default NavigationArrows;