// app/page.tsx
"use server";
import getHeader from "@/lib/getHeader";
import { getSessionUser } from "@/lib/getUserSession";
import { SessionData } from "@/types/type";
import { apiUrl } from "@/utils/envConfig";
import { redirect } from "next/navigation";

async function getLatestVideoId({ session }: { session: SessionData }) {
  const headers = await getHeader({ user: session.user })
  const response = await fetch(`${apiUrl}/api/video?page=1&limit=1`, {
    headers: headers
  });
  const data = await response.json();
  return data.data[0]?.id;
}

export default async function Home() {
  const session: SessionData = await getSessionUser();
  const latestVideoId = await getLatestVideoId({ session: session });
  redirect(`/${latestVideoId}`);
  return null;
}