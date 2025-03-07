'use client';
import Hls from 'hls.js';
import { ProfileCircle } from 'iconsax-react';
import { motion } from 'framer-motion';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import SrtParser from 'srt-parser-2';
import Image from 'next/image';

interface VideoData {
    id: string;
    source: string;
    orientation: string;
    authorName?: string;
    authorProfilePicture?: string;
    description?: string;
    thumbnailSprite?: string;
    thumbnailUrl?: string;
    thread_name?: string;
    createdAt?: string;
}

interface VideoPlayerProps {
    video: VideoData;
    isSoundEnabled: boolean;
    videoRef: (el: HTMLVideoElement | null) => void;
    onUserPlay: () => void;
}

export default function VideoPlayer({ video, isSoundEnabled, videoRef, onUserPlay }: VideoPlayerProps) {
    const internalVideoRef = useRef<HTMLVideoElement | null>(null);
    const thumbnailVideoRef = useRef<HTMLVideoElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(isSoundEnabled ? 1 : 0);
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

    const toSeconds = (timeStr: string) => {
        const parts = timeStr.split(/[:,]/).map(Number);
        return parts[0] * 3600 + parts[1] * 60 + parts[2] + parts[3] / 1000;
    };

    useEffect(() => {
        const videoEl = internalVideoRef.current;
        if (!videoEl) return;

        if (isHlsSource && Hls.isSupported()) {
            const hls = new Hls({
                autoStartLoad: true,
                startLevel: 0,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
            });
            hlsRef.current = hls;
            hls.loadSource(video.source);
            hls.attachMedia(videoEl);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS manifest parsed, ready to buffer');
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data);
                if (data.fatal) {
                    hls.destroy();
                    videoEl.src = video.source;
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

    useEffect(() => {
        const videoEl = internalVideoRef.current;
        if (!videoEl) return;

        videoEl.volume = volume;
        videoEl.muted = true; // Start muted to comply with browser policies
        videoEl.playbackRate = 1;

        const onLoadedMetadata = () => {
            setDuration(videoEl.duration);
            videoEl.currentTime = 0;
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
    }, [video.source, volume]);

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
        const videoEl = internalVideoRef.current;
        if (videoEl.paused) {
            videoEl.muted = false;
            videoEl.play()
                .then(() => {
                    setIsPlaying(true);
                    onUserPlay();
                })
                .catch((err) => console.error('Play error:', err));
        } else {
            videoEl.pause();
            setIsPlaying(false);
        }
        setShowOverlay(true);
        overlayTimeoutRef.current = setTimeout(() => setShowOverlay(false), 800);
    };

    const debounceVolumeChange = useCallback((newVolume: number) => {
        if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
        volumeTimeoutRef.current = setTimeout(() => {
            if (internalVideoRef.current) {
                internalVideoRef.current.volume = newVolume;
                internalVideoRef.current.muted = newVolume === 0;
                console.log(`Volume applied: ${newVolume}, Muted: ${internalVideoRef.current.muted}, Actual Volume: ${internalVideoRef.current.volume}`);
            }
        }, 100); // Debounce by 100ms to prevent rapid updates
    }, []);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        debounceVolumeChange(newVolume);
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isHovered) return;
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (internalVideoRef.current) internalVideoRef.current.currentTime = newTime;
    };

    const generateThumbnail = (time: number) => {
        const videoEl = thumbnailVideoRef.current;
        if (!videoEl || !duration) return;

        const canvas = document.createElement('canvas');
        canvas.width = 90;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');

        videoEl.currentTime = time;
        videoEl.onseeked = () => {
            if (ctx) {
                try {
                    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                    setThumbnailUrl(canvas.toDataURL('image/jpeg'));
                } catch (err) {
                    console.error('Failed to generate thumbnail:', err);
                    setThumbnailUrl(null);
                }
            }
        };
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
        if (!video.thumbnailSprite && !video.thumbnailUrl) {
            generateThumbnail(newHoverTime);
        }
    };

    useEffect(() => {
        return () => {
            if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
            if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
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
            <video
                onClick={handlePlayPause}
                ref={(el) => {
                    internalVideoRef.current = el;
                    videoRef(el);
                }}
                loop
                playsInline
                preload="auto"
                crossOrigin="anonymous"
                className="object-cover w-full h-[615px] rounded-xl cursor-pointer absolute bottom-0"
            />
            <video
                ref={thumbnailVideoRef}
                src={video.source}
                muted
                preload="metadata"
                crossOrigin="anonymous"
                className="hidden"
            />
            <motion.div
                className="absolute top-11 left-2 z-10 flex items-center p-2 rounded-full bg-black bg-opacity-50 cursor-pointer"
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
                    />
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
            <div
                className="absolute bottom-0 left-0 w-full h-32 z-10 px-4 py-3 flex flex-col space-y-2 rounded-b-xl justify-end items-start"
                style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%)' }}
            >
                <div className="flex items-center space-x-2">
                    {video.authorProfilePicture ? (
                        <Image src={video.authorProfilePicture} alt={`${video.authorName} image`} width={20} height={20} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <ProfileCircle size="32" color="#BE41D2" variant="Bold" />
                    )}
                    <div>
                        <span className="text-white font-bold">{video.authorName}</span>
                        <span className='text-white font-medium text-sm'>{video.createdAt}</span>
                    </div>
                </div>
                {currentCaption && (
                    <p className="bg-purple-600 bg-opacity-75 text-white px-3 py-1 rounded-md text-left line-clamp-2">
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
                    />
                    <div
                        className={`absolute bottom-0 left-0 w-full ${isHovered ? "h-[5px] rounded-lg" : "h-[2px]"} bg-gray-500 opacity-70`}
                        style={{
                            background: `linear-gradient(to right, #BE41D2 ${((currentTime / duration) * 100) || 0}%, #999 ${((currentTime / duration) * 100) || 0}%)`,
                        }}
                    />
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
                        <span className="icon-[solar--pause-bold] size-7" />
                    ) : (
                        <span className="icon-[solar--play-bold] size-8" />
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