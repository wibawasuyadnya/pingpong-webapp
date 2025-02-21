// app/api/convert/route.ts
import { NextResponse } from "next/server";
import webmToMp4 from "webm-to-mp4"; 

export async function POST(request: Request) {
  try {
    // Parse incoming form-data
    const formData = await request.formData();
    const fileField = formData.get("file");
    if (!fileField || typeof fileField === "string") {
      return NextResponse.json({ error: "File not provided" }, { status: 400 });
    }

    // Read the uploaded file as an ArrayBuffer, then convert it to a Buffer
    const arrayBuffer = await fileField.arrayBuffer();
    const webmBuffer = Buffer.from(arrayBuffer);

    // Convert the WebM buffer to an MP4 buffer using webm-to-mp4
    const mp4Buffer = webmToMp4(webmBuffer);

    // Return the MP4 file as the response with the proper Content-Type
    return new NextResponse(mp4Buffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="converted.mp4"'
      }
    });
  } catch (error: any) {
    console.error("Conversion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
