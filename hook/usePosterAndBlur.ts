// usePosterAndBlur.ts
"use client";
import { useEffect, useState } from "react";

interface PosterAndBlur {
  poster: string | null;
  blurDataURL: string | null;
  videoWidth: number | null;
  videoHeight: number | null;
}

export default function usePosterAndBlur(videoSrc: string, captureTime = 1): PosterAndBlur {
  const [poster, setPoster] = useState<string | null>(null);
  const [blurDataURL, setBlurDataURL] = useState<string | null>(null);
  const [videoWidth, setVideoWidth] = useState<number | null>(null);
  const [videoHeight, setVideoHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!videoSrc) return;

    const videoEl = document.createElement("video");
    videoEl.src = videoSrc;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.crossOrigin = "anonymous";

    videoEl.onloadedmetadata = () => {
      // store real video dimensions
      setVideoWidth(videoEl.videoWidth);
      setVideoHeight(videoEl.videoHeight);

      // clamp captureTime if needed
      let seekTime = captureTime;
      if (seekTime > videoEl.duration) {
        seekTime = videoEl.duration / 2;
      }
      videoEl.currentTime = seekTime;
    };

    videoEl.onseeked = () => {
      // create the main poster
      const posterData = captureFrame(videoEl, 640, 360);
      setPoster(posterData);

      // create the blur
      const blurData = captureFrame(videoEl, 32, 18);
      setBlurDataURL(blurData);
    };

    return () => {
      videoEl.src = "";
      videoEl.load();
      videoEl.remove();
    };
  }, [videoSrc, captureTime]);

  function captureFrame(video: HTMLVideoElement, width: number, height: number) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.7);
  }

  return { poster, blurDataURL, videoWidth, videoHeight };
}
