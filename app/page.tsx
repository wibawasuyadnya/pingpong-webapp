"use server"
import { redirect } from 'next/navigation';
export default async function Home() {
  redirect('/1');
  return null;
}
