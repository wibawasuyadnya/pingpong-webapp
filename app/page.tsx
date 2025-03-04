"use server";
import getHeader from "@/lib/getHeader";
import { getSessionUser } from "@/lib/getUserSession";
import { SessionData } from "@/types/type";
import { apiUrl } from "@/utils/envConfig";
import { redirect } from "next/navigation";

// Fetch the latest video ID from the API
async function getLatestVideoId({ session }: { session: SessionData }): Promise<string> {
  const headers = await getHeader({ user: session.user });
  const params = new URLSearchParams({
    page: "1",
    limit: "1",
  });

  const res = await fetch(`${apiUrl}/api/video?${params.toString()}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch video list");
  }

  const data = await res.json();
  console.log(data);
  const latestVideo = data.data[0];
  return latestVideo.id;
}

export default async function Home() {
  const session: SessionData = await getSessionUser();
  const latestId = await getLatestVideoId({ session });
  redirect(`/${latestId}`);
}