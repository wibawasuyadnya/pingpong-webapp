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
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-20">
            <button
                onClick={onUpClick}
                disabled={currentIndex === null || currentIndex === 0}
                className="p-2 bg-gray-800 bg-opacity-50 rounded-full text-white disabled:opacity-50"
                aria-label="Previous video"
            >
                <ChevronUp size={24} />
            </button>
            <button
                onClick={onDownClick}
                disabled={currentIndex === null || currentIndex === totalVideos - 1}
                className="p-2 bg-gray-800 bg-opacity-50 rounded-full text-white disabled:opacity-50"
                aria-label="Next video"
            >
                <ChevronDown size={24} />
            </button>
        </div>
    );
};

export default NavigationArrows;