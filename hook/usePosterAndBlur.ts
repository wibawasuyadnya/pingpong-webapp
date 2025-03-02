"use client";
import { useEffect, useState } from "react";

interface PosterAndBlur {
  poster: string | null;
  blurDataURL: string | null;
  videoWidth: number | null;
  videoHeight: number | null;
}

/**
 * Grabs a poster frame from a video at `captureTime` seconds,
 * generating both a larger "poster" and a small "blurDataURL".
 * The video is drawn in "contain" mode so it doesn't get cropped for portrait.
 */
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
      const posterData = captureFrameContain(videoEl, 640, 360);
      setPoster(posterData);

      // create the blur
      const blurData = captureFrameContain(videoEl, 32, 18);
      setBlurDataURL(blurData);
    };

    return () => {
      videoEl.src = "";
      videoEl.load();
      videoEl.remove();
    };
  }, [videoSrc, captureTime]);

  /**
   * Draws the current frame of `video` onto a canvas of `targetWidth × targetHeight`
   * using a "contain" approach (no cropping for portrait).
   */
  function captureFrameContain(
    video: HTMLVideoElement,
    targetWidth: number,
    targetHeight: number
  ): string {
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Original video dimensions
    const vidW = video.videoWidth;
    const vidH = video.videoHeight;
    if (!vidW || !vidH) return "";

    // We want to scale so that the entire video fits within targetWidth × targetHeight
    const videoAspect = vidW / vidH;
    const canvasAspect = targetWidth / targetHeight;

    let drawWidth = targetWidth;
    let drawHeight = targetHeight;

    // "Contain" approach
    if (videoAspect > canvasAspect) {
      // Video is wider, so we fit by width
      drawWidth = targetWidth;
      drawHeight = drawWidth / videoAspect;
    } else {
      // Video is taller (or equal), so we fit by height
      drawHeight = targetHeight;
      drawWidth = drawHeight * videoAspect;
    }

    // Center the image
    const offsetX = (targetWidth - drawWidth) / 2;
    const offsetY = (targetHeight - drawHeight) / 2;

    ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    return canvas.toDataURL("image/jpeg", 0.7);
  }

  return { poster, blurDataURL, videoWidth, videoHeight };
}
