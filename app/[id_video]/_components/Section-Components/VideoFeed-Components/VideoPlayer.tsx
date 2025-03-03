'use client';
import { ProfileCircle } from 'iconsax-react';
import { motion } from 'framer-motion';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
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
    const [isHovered, setIsHovered] = useState(false);
    const [isVolumeHovered, setIsVolumeHovered] = useState(false);


    const handlePlayPause = () => {
        if (!internalVideoRef.current) return;
        if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);

        if (internalVideoRef.current.paused) {
            internalVideoRef.current.play().then(() => setIsPlaying(true)).catch((err) => console.error("Play error:", err));
        } else {
            internalVideoRef.current.pause();
            setIsPlaying(false);
        }

        setShowOverlay(true);
        overlayTimeoutRef.current = setTimeout(() => setShowOverlay(false), 800);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (internalVideoRef.current) {
            internalVideoRef.current.volume = newVolume;
            internalVideoRef.current.muted = newVolume === 0;
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isHovered) return;
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (internalVideoRef.current) internalVideoRef.current.currentTime = newTime;
    };


    // const formatTime = (time: number) => {
    //     const minutes = Math.floor(time / 60);
    //     const seconds = Math.floor(time % 60);
    //     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    // };

    useEffect(() => {
        const videoEl = internalVideoRef.current;
        if (!videoEl) return;

        const onLoadedMetadata = () => setDuration(videoEl.duration);
        const onTimeUpdate = () => setCurrentTime(videoEl.currentTime);
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

    useEffect(() => {
        return () => {
            if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
        };
    }, []);

    return (
        <div className="relative w-full h-full rounded-lg">
            {/* Video Element */}
            <video
                onClick={handlePlayPause}
                ref={(el) => {
                    internalVideoRef.current = el;
                    videoRef(el);
                }}
                src={video.source}
                loop
                muted={!isSoundEnabled}
                playsInline
                className="object-cover w-full h-full rounded-lg cursor-pointer"
            />

            {/* Volume Control with Expanding Background */}
            <motion.div
                className="absolute top-4 left-4 z-10 flex items-center p-2 rounded-full bg-black bg-opacity-50 cursor-pointer"
                onHoverStart={() => setIsVolumeHovered(true)}
                onHoverEnd={() => setIsVolumeHovered(false)}
                animate={{
                    width: isVolumeHovered ? "120px" : "40px", // Expands to right
                    paddingLeft: isVolumeHovered ? "12px" : "8px",
                    paddingRight: isVolumeHovered ? "12px" : "8px",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {/* Volume Icon (Fixed Position) */}
                <div className="flex-shrink-0">
                    {volume === 0 ? (
                        <VolumeX size={20} color="white" />
                    ) : volume > 0.5 ? (
                        <Volume2 size={20} color="white" />
                    ) : (
                        <Volume1 size={20} color="white" />
                    )}
                </div>

                {/* Volume Slider (Expanding on Hover) */}
                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                        scaleX: isVolumeHovered ? 1 : 0,
                        opacity: isVolumeHovered ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative origin-left w-24 h-[10px] flex items-center ml-2"
                >
                    {/* Volume Progress Bar */}
                    <div
                        className="absolute bottom-1 left-0 w-full h-[4px] bg-gray-500 opacity-70 rounded-lg"
                        style={{
                            background: `linear-gradient(to right, #FFF ${volume * 100}%, #999 ${volume * 100}%)`
                        }}
                    ></div>

                    {/* Volume Input Slider */}
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="absolute w-full bottom-1 h-[4px] opacity-100 transition-opacity duration-300"
                        style={{
                            appearance: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                        }}
                    />
                </motion.div>
            </motion.div>


            {/* Bottom Overlay */}
            <div
                className="absolute bottom-0 left-0 w-full h-32 z-10 px-4 py-3 flex flex-col space-y-2 rounded-b-lg justify-end items-start"
                style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%)' }}
            >
                {/* Author Info & Description */}
                <div className="flex items-center space-x-2">
                    {video.authorProfilePicture ? (
                        <img src={video.authorProfilePicture} alt={video.authorName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <ProfileCircle size="32" color="#BE41D2" variant="Bulk" />
                    )}
                    <span className="text-white font-bold">{video.authorName || 'Unknown'}</span>
                </div>
                <p className="text-sm text-white">{video.description || 'No description available.'}</p>

                {/* Interactive Progress Bar */}
                <div
                    className="relative w-full"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Progress Bar Background (thin stroke when not hovered) */}
                    <div
                        className={`absolute bottom-0 left-0 w-full ${isHovered ? "h-[5px] rounded-lg" : "h-[2px]"} bg-gray-500 opacity-70`}
                        style={{
                            background: `linear-gradient(to right, #BE41D2 ${((currentTime / duration) * 100) || 0}%, #999 ${((currentTime / duration) * 100) || 0}%)`
                        }}
                    ></div>

                    {/* Progress Bar Input */}
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        step="0.1"
                        value={currentTime}
                        onChange={handleProgressChange}
                        className={`absolute w-full bottom-0 transition-all duration-300 ${isHovered ? 'opacity-100 h-[5px]' : 'opacity-0 h-0'
                            }`}
                        style={{
                            appearance: 'none',
                            background: 'transparent',
                            cursor: isHovered ? 'pointer' : 'default',
                        }}
                    />
                </div>
            </div>
            {/* Centered Play/Pause Button Overlay (shows only briefly) */}
            {
                showOverlay && (
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
                )
            }
            {/* Custom Styles for White Volume Slider & Purple Progress Bar */}
            <style jsx>{`
                /* White Bullet for Volume */
                input[type="range"]:not(.progress-bar)::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 10px;
                    height: 10px;
                    background: #FFFFFF;
                    border-radius: 50%;
                    cursor: pointer;
                }
                
                input[type="range"]:not(.progress-bar)::-moz-range-thumb {
                    width: 10px;
                    height: 10px;
                    background: #FFFFFF;
                    border-radius: 50%;
                    cursor: pointer;
                }

                /* Purple Bullet for Progress Bar */
                input.progress-bar::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    background: #BE41D2;
                    border-radius: 50%;
                    cursor: pointer;
                }

                input.progress-bar::-moz-range-thumb {
                    width: 12px;
                    height: 12px;
                    background: #BE41D2;
                    border-radius: 50%;
                    cursor: pointer;
                }
            `}</style>
        </div >
    );
}
