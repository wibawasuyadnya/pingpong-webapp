import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { awsAccessKeyId, awsBucket, awsDefaultRegion, awsSecretAccessKey } from "@/utils/envConfig";

const s3 = new S3Client({
  region: awsDefaultRegion!,
  credentials: {
    accessKeyId: awsAccessKeyId!,
    secretAccessKey: awsSecretAccessKey!,
  },
});
const BUCKET_NAME = awsBucket!;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const s3Key = `testing/${randomUUID()}-${file.name}`;

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: "video/mp4",
      })
    );

    return NextResponse.json({ filename: s3Key });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
