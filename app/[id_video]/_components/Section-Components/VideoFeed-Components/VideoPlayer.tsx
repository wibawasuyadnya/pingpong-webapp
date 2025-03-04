'use client';
import { ProfileCircle } from 'iconsax-react';
import { motion } from 'framer-motion';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import VideoSkeleton from './VideoSkeleton';

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
    isTransitioning: boolean;
}

export default function VideoFeedPlayer({
    video,
    isSoundEnabled,
    videoRef,
    isTransitioning,
}: VideoFeedPlayerProps) {
    const internalVideoRef = useRef<HTMLVideoElement | null>(null);
    const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const thumbnailVideoRef = useRef<HTMLVideoElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isVolumeHovered, setIsVolumeHovered] = useState(false);
    const [thumbnailPosition, setThumbnailPosition] = useState(0);
    const [thumbnailTime, setThumbnailTime] = useState(0);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Handle video loading, buffering, and errors
    useEffect(() => {
        const videoEl = internalVideoRef.current;
        if (!videoEl) return;

        const onLoadedMetadata = () => {
            setDuration(videoEl.duration);
        };
        const onCanPlayThrough = () => {
            setIsVideoReady(true);
            setHasError(false);
        };
        const onError = () => {
            setHasError(true);
            setIsVideoReady(false);
        };
        const onTimeUpdate = () => setCurrentTime(videoEl.currentTime);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        videoEl.addEventListener('loadedmetadata', onLoadedMetadata);
        videoEl.addEventListener('canplaythrough', onCanPlayThrough);
        videoEl.addEventListener('error', onError);
        videoEl.addEventListener('timeupdate', onTimeUpdate);
        videoEl.addEventListener('play', onPlay);
        videoEl.addEventListener('pause', onPause);

        return () => {
            videoEl.removeEventListener('loadedmetadata', onLoadedMetadata);
            videoEl.removeEventListener('canplaythrough', onCanPlayThrough);
            videoEl.removeEventListener('error', onError);
            videoEl.removeEventListener('timeupdate', onTimeUpdate);
            videoEl.removeEventListener('play', onPlay);
            videoEl.removeEventListener('pause', onPause);
        };
    }, [video.source]);

    // Thumbnail generation logic
    const generateThumbnail = (time: number) => {
        if (!thumbnailVideoRef.current) return;

        const videoEl = thumbnailVideoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.orientation === 'landscape' ? 160 : 90;
        canvas.height = video.orientation === 'landscape' ? 90 : 160;
        const ctx = canvas.getContext('2d');

        videoEl.currentTime = time;
        videoEl.onseeked = () => {
            if (ctx) {
                ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                setThumbnailUrl(canvas.toDataURL('image/jpeg'));
            }
        };
    };

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
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (internalVideoRef.current) {
            internalVideoRef.current.currentTime = newTime;
        }
    };

    const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || !isHovered) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const position = e.clientX - rect.left;
        const percentage = position / rect.width;
        const hoverTime = percentage * duration;

        const thumbnailWidth = video.orientation === 'landscape' ? 160 : 90;
        const clampedPosition = Math.max(thumbnailWidth / 2, Math.min(position, rect.width - thumbnailWidth / 2));

        setThumbnailPosition(clampedPosition);
        setThumbnailTime(hoverTime);
        generateThumbnail(hoverTime);
    };

    useEffect(() => {
        return () => {
            if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
        };
    }, []);

    return (
        <div className={`relative w-full ${video.orientation === 'portrait' ? "h-[650px]" : "h-[500px]"} rounded-lg`}> {/* Fixed height to match container */}
            {/* Skeleton for transition, loading, or error */}
            {(isTransitioning || !isVideoReady || hasError) && (
                <div className="absolute inset-0">
                    <VideoSkeleton orientation={video.orientation as 'portrait' | 'landscape'} />
                </div>
            )}

            {/* Video element */}
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
                preload="metadata"
                className={`object-cover w-full h-full rounded-lg cursor-pointer ${(isTransitioning || !isVideoReady || hasError) ? 'opacity-0' : 'opacity-100'}`}
            />

            {/* Hidden video for thumbnails */}
            <video
                ref={thumbnailVideoRef}
                src={video.source}
                muted
                preload="metadata"
                className="hidden"
            />

            {/* Volume Control */}
            <motion.div
                className="absolute top-4 left-4 z-10 flex flex-row gap-0 items-center justify-center p-2 rounded-full bg-black bg-opacity-50 cursor-pointer"
                onHoverStart={() => setIsVolumeHovered(true)}
                onHoverEnd={() => setIsVolumeHovered(false)}
                animate={{
                    width: isVolumeHovered ? "120px" : "40px",
                    paddingLeft: isVolumeHovered ? "12px" : "15px",
                    paddingRight: isVolumeHovered ? "12px" : "8px",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <div className="flex-shrink-0 items-center">
                    {volume === 0 ? (
                        <VolumeX size={20} color="white" />
                    ) : volume > 0.5 ? (
                        <Volume2 size={20} color="white" />
                    ) : (
                        <Volume1 size={20} color="white" />
                    )}
                </div>
                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{
                        scaleX: isVolumeHovered ? 1 : 0,
                        opacity: isVolumeHovered ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative origin-left w-24 h-[10px] flex items-center ml-2"
                >
                    <div
                        className="absolute bottom-1 left-0 w-full h-[4px] bg-gray-500 opacity-70 rounded-lg"
                        style={{
                            background: `linear-gradient(to right, #FFF ${volume * 100}%, #999 ${volume * 100}%)`
                        }}
                    ></div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="absolute w-full bottom-1 h-[4px] opacity-100 transition-opacity duration-300"
                        style={{ appearance: 'none', background: 'transparent', cursor: 'pointer' }}
                    />
                </motion.div>
            </motion.div>

            {/* Bottom Overlay */}
            <div
                className="absolute bottom-0 left-0 w-full h-32 z-10 px-4 py-3 flex flex-col space-y-2 rounded-b-lg justify-end items-start"
                style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%)' }}
            >
                <div className="flex items-center space-x-2">
                    {video.authorProfilePicture ? (
                        <img src={video.authorProfilePicture} alt={video.authorName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <ProfileCircle size="32" color="#BE41D2" variant="Bulk" />
                    )}
                    <span className="text-white font-bold">{video.authorName || 'Unknown'}</span>
                </div>
                <p className="text-sm text-white">{video.description || 'No description available.'}</p>

                <div
                    ref={progressBarRef}
                    className="relative w-full"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => {
                        setIsHovered(false);
                        setThumbnailUrl(null);
                    }}
                    onMouseMove={handleProgressHover}
                >
                    <div
                        className={`absolute bottom-0 left-0 w-full ${isHovered ? "h-[5px] rounded-lg" : "h-[2px]"} bg-gray-500 opacity-70`}
                        style={{
                            background: `linear-gradient(to right, #BE41D2 ${((currentTime / duration) * 100) || 0}%, #999 ${((currentTime / duration) * 100) || 0}%)`
                        }}
                    ></div>
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        step="0.1"
                        value={currentTime}
                        onChange={handleProgressChange}
                        className={`progress-playback absolute w-full bottom-0 transition-all duration-300 ${isHovered ? 'opacity-100 h-[5px]' : 'opacity-0 h-0'}`}
                        style={{
                            appearance: 'none',
                            background: 'transparent',
                            cursor: isHovered ? 'pointer' : 'default',
                        }}
                    />
                    {isHovered && thumbnailUrl && (
                        <motion.div
                            className="absolute z-20 rounded-lg"
                            style={{
                                left: `${thumbnailPosition - (video.orientation === 'landscape' ? 80 : 45)}px`,
                                bottom: `${video.orientation === 'landscape' ? 35 : 50}px`,
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <img
                                src={thumbnailUrl}
                                alt="Preview"
                                className={`rounded-md shadow-lg border-2 border-[#B14AE2] ${video.orientation === 'landscape' ? 'w-[160px] h-[90px]' : 'w-[90px] h-[160px]'}`}
                            />
                            <span className="absolute bottom-1 left-1 text-xs text-white bg-black bg-opacity-70 px-1 rounded">
                                {Math.floor(thumbnailTime / 60)}:{Math.floor(thumbnailTime % 60).toString().padStart(2, '0')}
                            </span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Play/Pause Overlay */}
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

            {/* Custom Styles */}
            <style jsx>{`
                input[type="range"]:not(.progress-playback)::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 10px;
                    height: 10px;
                    background: #FFFFFF;
                    border-radius: 50%;
                    cursor: pointer;
                }
                input[type="range"]:not(.progress-playback)::-moz-range-thumb {
                    width: 10px;
                    height: 10px;
                    background: #FFFFFF;
                    border-radius: 50%;
                    cursor: pointer;
                }
                input.progress-playback::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    background: #BE41D2;
                    border-radius: 50%;
                    cursor: pointer;
                }
                input.progress-playback::-moz-range-thumb {
                    width: 12px;
                    height: 12px;
                    background: #BE41D2;
                    border-radius: 50%;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}