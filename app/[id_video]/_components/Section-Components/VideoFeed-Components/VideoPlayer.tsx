'use client';
import Hls from 'hls.js';
import { ProfileCircle } from 'iconsax-react';
import { motion } from 'framer-motion';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import SrtParser from 'srt-parser-2';

interface VideoData {
    id: string;
    source: string;
    orientation: string;
    authorName?: string;
    authorProfilePicture?: string;
    description?: string; // URL to the .srt file
    thumbnailSprite?: string;
    thumbnailUrl?: string;
}

interface VideoPlayerProps {
    video: VideoData;
    isSoundEnabled: boolean;
    videoRef: (el: HTMLVideoElement | null) => void;
}

export default function VideoPlayer({
    video,
    isSoundEnabled,
    videoRef,
}: VideoPlayerProps) {
    const internalVideoRef = useRef<HTMLVideoElement | null>(null);
    const thumbnailVideoRef = useRef<HTMLVideoElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isVolumeHovered, setIsVolumeHovered] = useState(false);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [thumbnailPosition, setThumbnailPosition] = useState<number>(0);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [parsedCaptions, setParsedCaptions] = useState<
        Array<{ startTime: number; endTime: number; text: string }>
    >([]);
    const [currentCaption, setCurrentCaption] = useState<string>('');

    const isHlsSource = video.source.includes('.m3u8');

    // Helper to convert SRT time "00:00:01,000" to seconds
    const toSeconds = (timeStr: string) => {
        const parts = timeStr.split(/[:,]/).map(Number);
        return parts[0] * 3600 + parts[1] * 60 + parts[2] + parts[3] / 1000;
    };

    // HLS setup and fallback logic
    useEffect(() => {
        const videoEl = internalVideoRef.current;
        if (!videoEl) return;
        if (isHlsSource && Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(video.source);
            hls.attachMedia(videoEl);
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('HLS Error:', data);
                    hls.destroy();
                }
            });
        } else {
            videoEl.src = video.source;
        }
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [video.source, isHlsSource]);

    // Autoplay and video event listeners
    useEffect(() => {
        const videoEl = internalVideoRef.current;
        if (!videoEl) return;
        videoEl.muted = !isSoundEnabled;
        videoEl.volume = volume;
        const attemptAutoplay = () => {
            if (!videoEl.paused) return;
            videoEl.play()
                .then(() => setIsPlaying(true))
                .catch((err) => {
                    console.warn('Autoplay blocked:', err);
                    setIsPlaying(false);
                });
        };
        attemptAutoplay();
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
    }, [video.source, isSoundEnabled, volume]);

    // Fetch and parse the .srt file using srt-parser-2
    useEffect(() => {
        async function fetchCaptions() {
            try {
                const res = await fetch(video.description || '');
                const srtText = await res.text();
                const parser = new SrtParser();
                const parsed = parser.fromSrt(srtText);
                const parsedWithSeconds = parsed.map((item: any) => ({
                    startTime: toSeconds(item.startTime),
                    endTime: toSeconds(item.endTime),
                    text: item.text,
                }));
                setParsedCaptions(parsedWithSeconds);
            } catch (err) {
                console.error('Error loading captions:', err);
            }
        }
        if (video.description && video.description.endsWith('.srt')) {
            fetchCaptions();
        }
    }, [video.description]);

    // Update currentCaption based on currentTime
    useEffect(() => {
        if (parsedCaptions.length === 0) return;
        const matching = parsedCaptions.find(
            (caption) => currentTime >= caption.startTime && currentTime <= caption.endTime
        );
        if (matching) {
            setCurrentCaption(matching.text);
        } else {
            setCurrentCaption('');
        }
    }, [currentTime, parsedCaptions]);

    const handlePlayPause = () => {
        if (!internalVideoRef.current) return;
        if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
        if (internalVideoRef.current.paused) {
            internalVideoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((err) => console.error('Play error:', err));
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

    const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || !duration) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const hoverPercentage = offsetX / rect.width;
        const newHoverTime = hoverPercentage * duration;
        const thumbnailWidth = 90;
        const clampedPosition = Math.max(thumbnailWidth / 2, Math.min(offsetX, rect.width - thumbnailWidth / 2));
        setHoverTime(newHoverTime);
        setThumbnailPosition(clampedPosition);
    };

    useEffect(() => {
        return () => {
            if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
        };
    }, []);

    const getThumbnailStyle = () => {
        if (!hoverTime || !isHovered) return { display: 'none' };
        const thumbnailWidth = 90;
        const thumbnailHeight = 160;
        if (video.thumbnailSprite) {
            const frameCount = 10;
            const frameWidth = 100;
            const frameIndex = Math.min(Math.floor((hoverTime / duration) * frameCount), frameCount - 1);
            return {
                backgroundImage: `url(${video.thumbnailSprite})`,
                backgroundPosition: `-${frameIndex * frameWidth}px 0`,
                width: `${frameWidth}px`,
                height: '56px',
                left: `${thumbnailPosition}px`,
                transform: 'translateX(-50%)',
            };
        } else if (video.thumbnailUrl) {
            return {
                backgroundImage: `url(${video.thumbnailUrl})`,
                width: `${thumbnailWidth}px`,
                height: `${thumbnailHeight}px`,
                left: `${thumbnailPosition}px`,
                transform: 'translateX(-50%)',
            };
        } else if (thumbnailUrl) {
            return {
                backgroundImage: `url(${thumbnailUrl})`,
                width: `${thumbnailWidth}px`,
                height: `${thumbnailHeight}px`,
                left: `${thumbnailPosition}px`,
                transform: 'translateX(-50%)',
            };
        }
        return { display: 'none' };
    };

    return (
        <div className="relative w-full h-[650px] rounded-xl">
            {/* Main Video Element */}
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
                crossOrigin="anonymous"
                className="object-cover w-full h-full rounded-xl cursor-pointer"
            />

            {/* Hidden Video Element for Thumbnail Generation */}
            <video
                ref={thumbnailVideoRef}
                src={video.source}
                muted
                preload="metadata"
                crossOrigin="anonymous"
                className="hidden"
            />

            {/* Volume Control */}
            <motion.div
                className="absolute top-4 left-4 z-10 flex items-center p-2 rounded-full bg-black bg-opacity-50 cursor-pointer"
                onHoverStart={() => setIsVolumeHovered(true)}
                onHoverEnd={() => setIsVolumeHovered(false)}
                animate={{
                    width: isVolumeHovered ? "120px" : "40px",
                    paddingLeft: isVolumeHovered ? "12px" : "8px",
                    paddingRight: isVolumeHovered ? "12px" : "8px",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <div className="flex-shrink-0">
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
                        className="absolute bottom-1 left-0 w-full h-[4px] bg-gray-500 opacity-70 rounded-xl"
                        style={{
                            background: `linear-gradient(to right, #FFF ${volume * 100}%, #999 ${volume * 100}%)`,
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
                        style={{
                            appearance: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                        }}
                    />
                </motion.div>
            </motion.div>

            {/* Bottom Overlay with additional controls */}
            <div
                className="absolute bottom-0 left-0 w-full h-32 z-10 px-4 py-3 flex flex-col space-y-2 rounded-b-xl justify-end items-start"
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
                {/* Instead of video.description, display parsed captions */}
                {/* Caption Overlay */}
                {currentCaption && (
                    <p className=" bg-purple-600 bg-opacity-75 text-white px-4 py-2 rounded-md text-left line-clamp w-fit">
                        {currentCaption}
                    </p>
                )}

                <div
                    ref={progressBarRef}
                    className="relative w-full"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => {
                        setIsHovered(false);
                        setHoverTime(null);
                        setThumbnailUrl(null);
                    }}
                    onMouseMove={handleProgressHover}
                >
                    <div
                        className="absolute bottom-8 z-20 bg-cover bg-center rounded-md shadow-lg border-2 border-[#B14AE2]"
                        style={getThumbnailStyle()}
                    ></div>

                    <div
                        className={`absolute bottom-0 left-0 w-full ${isHovered ? "h-[5px] rounded-lg" : "h-[2px]"} bg-gray-500 opacity-70`}
                        style={{
                            background: `linear-gradient(to right, #BE41D2 ${((currentTime / duration) * 100) || 0}%, #999 ${((currentTime / duration) * 100) || 0}%)`,
                        }}
                    ></div>
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        step="0.1"
                        value={currentTime}
                        onChange={handleProgressChange}
                        className={`vid-progress absolute w-full bottom-0 transition-all duration-300 ${isHovered ? 'opacity-100 h-[5px]' : 'opacity-0 h-0'}`}
                        style={{
                            appearance: 'none',
                            background: 'transparent',
                            cursor: isHovered ? 'pointer' : 'default',
                        }}
                    />
                </div>
            </div>

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

            <style jsx>{`
        input[type="range"]:not(.vid-progress)::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          background: #FFFFFF;
          border-radius: 50%;
          cursor: pointer;
        }
        input[type="range"]:not(.vid-progress)::-moz-range-thumb {
          width: 10px;
          height: 10px;
          background: #FFFFFF;
          border-radius: 50%;
          cursor: pointer;
        }
        input.vid-progress::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: #BE41D2;
          border-radius: 50%;
          cursor: pointer;
        }
        input.vid-progress::-moz-range-thumb {
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
