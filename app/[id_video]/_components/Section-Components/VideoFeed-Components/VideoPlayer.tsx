'use client';
import { Pause, Play, ProfileCircle } from 'iconsax-react';
import React, { useRef, useState, useEffect } from 'react';

interface VideoData {
    id: string;
    source: string;
    orientation: string;
    authorName?: string;
    authorProfilePicture?: string;
    description?: string;
}

interface VideoFeedPlayerProps {
    video: VideoData;
    isSoundEnabled: boolean;
    videoRef: (el: HTMLVideoElement | null) => void;
}

export default function VideoFeedPlayer({
    video,
    isSoundEnabled,
    videoRef,
}: VideoFeedPlayerProps) {
    const internalVideoRef = useRef<HTMLVideoElement | null>(null);
    const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);

    const handlePlayPause = () => {
        if (!internalVideoRef.current) return;
        // Clear any existing timer
        if (overlayTimeoutRef.current) {
            clearTimeout(overlayTimeoutRef.current);
        }
        // Toggle play/pause state
        if (internalVideoRef.current.paused) {
            internalVideoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch((err) => console.error("Play error:", err));
        } else {
            internalVideoRef.current.pause();
            setIsPlaying(false);
        }
        // Show overlay and hide after 800ms
        setShowOverlay(true);
        overlayTimeoutRef.current = setTimeout(() => {
            setShowOverlay(false);
        }, 800);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (internalVideoRef.current) {
            internalVideoRef.current.volume = newVolume;
            if (newVolume > 0) {
                internalVideoRef.current.muted = false;
            }
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (internalVideoRef.current) {
            internalVideoRef.current.currentTime = newTime;
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    useEffect(() => {
        const videoEl = internalVideoRef.current;
        if (!videoEl) return;

        const onLoadedMetadata = () => {
            setDuration(videoEl.duration);
        };

        const onTimeUpdate = () => {
            setCurrentTime(videoEl.currentTime);
        };

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        videoEl.addEventListener('loadedmetadata', onLoadedMetadata);
        videoEl.addEventListener('timeupdate', onTimeUpdate);
        videoEl.addEventListener('play', onPlay);
        videoEl.addEventListener('pause', onPause);

        return () => {
            videoEl.removeEventListener('loadedmetadata', onLoadedMetadata);
            videoEl.removeEventListener('timeupdate', onTimeUpdate);
            videoEl.removeEventListener('play', onPlay);
            videoEl.removeEventListener('pause', onPause);
        };
    }, []);

    // Clean up the overlay timer on unmount
    useEffect(() => {
        return () => {
            if (overlayTimeoutRef.current) {
                clearTimeout(overlayTimeoutRef.current);
            }
        };
    }, []);

    // Determine height for portrait vs landscape
    const videoHeight = video.orientation === 'portrait' ? 'h-[620px]' : 'h-[500px]';

    return (
        <div className={`relative ${videoHeight} w-full rounded-lg`}>
            {/* Video Element */}
            <video
                onClick={handlePlayPause}
                ref={(el) => {
                    internalVideoRef.current = el;
                    videoRef(el);
                }}
                src={video.source}
                loop
                muted={!isSoundEnabled}  // Note: if isSoundEnabled remains false, the video stays muted.
                playsInline
                className="object-cover w-full h-full rounded-lg cursor-pointer"
            />
            {/* Volume Slider at Top Left */}
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black bg-opacity-50 px-2 py-1 rounded-lg">
                <span className="text-white text-sm">Vol</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24"
                />
            </div>
            {/* Bottom Overlay with Linear Gradient */}
            <div
                className="absolute bottom-0 left-0 w-full z-10 px-4 py-3 flex flex-col space-y-2 rounded-b-lg"
                style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.8) 100%)' }}
            >
                {/* Top Row: Author Info & Description */}
                <div className="flex items-center justify-between">
                    <div className="text-white">
                        <div className="flex items-center space-x-2">
                            {video.authorProfilePicture && video.authorProfilePicture !== "" ? (
                                <img
                                    src={video.authorProfilePicture}
                                    alt={video.authorName || 'Author'}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <ProfileCircle size="32" color="#BE41D2" variant="Bulk" />
                            )}
                            <span className="font-bold">{video.authorName || 'Author Name'}</span>
                        </div>
                        <p className="mt-1 text-sm">
                            {video.description || 'This is a sample description for the video.'}
                        </p>
                    </div>
                </div>
                {/* Interactive Progress Bar */}
                <div className="flex items-center space-x-2">
                    <span className="text-white text-xs">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        step="0.1"
                        value={currentTime}
                        onChange={handleProgressChange}
                        className="flex-grow"
                    />
                    <span className="text-white text-xs">{formatTime(duration)}</span>
                </div>
            </div>
            {/* Centered Play/Pause Button Overlay (shows only briefly) */}
            {showOverlay && (
                <button
                    onClick={handlePlayPause}
                    className="absolute w-fit h-fit m-auto inset-0 flex items-center justify-center text-white text-4xl z-10 bg-black bg-opacity-20 rounded-full transition-opacity py-6 px-6"
                    style={{ transitionDuration: '800ms' }}
                >
                    {isPlaying ? (
                        <span className="icon-[solar--pause-bold] size-7"></span>
                    ) : (
                        <span className="icon-[solar--play-bold] size-8"></span>
                    )}
                </button>
            )}
        </div>
    );
}
