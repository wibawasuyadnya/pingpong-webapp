"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
const ffmpeg = new FFmpeg();
let loaded = false;

async function loadFFmpeg(): Promise<void> {
    if (!loaded) {
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        loaded = true;
    }
}

export async function convertWebMToMP4(webmBlob: Blob): Promise<Blob> {
    await loadFFmpeg();

    // Clean previous files in the virtual FS
    try { ffmpeg.FS("unlink", "input.webm"); } catch (e) { }
    try { ffmpeg.FS("unlink", "output.mp4"); } catch (e) { }

    // Write the input WebM file
    await ffmpeg.writeFile("input.webm", await fetchFile(webmBlob));

    // Execute conversion with additional flags
    await ffmpeg.exec([
        "-i", "input.webm",
        "-c:v", "libx264",
        "-preset", "veryfast",         // optional, for faster encoding
        "-profile:v", "baseline",      // increases compatibility
        "-level", "3.0",
        "-pix_fmt", "yuv420p",         // ensures compatibility with players
        "-r", "30",                    // force a 30fps frame rate
        "-c:a", "aac",
        "-movflags", "+faststart",     // moves metadata to the start
        "output.mp4",
      ]);
      

    // Read the output file
    const data = await ffmpeg.readFile("output.mp4");

    return new Blob([data.buffer], { type: "video/mp4" });
}
