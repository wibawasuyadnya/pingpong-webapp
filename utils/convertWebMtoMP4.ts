// utils/convertWebMtoMP4.ts
export async function convertWebMToMP4(webmBlob: Blob): Promise<Blob> {
    const formData = new FormData();
    formData.append("file", webmBlob, "recording.webm");

    const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Conversion API error response:", errorText);
        throw new Error("Conversion API failed");
    }

    // Return the MP4 file as a Blob
    const mp4Blob = await response.blob();
    return mp4Blob;
}
