// src/app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { phone, password } = await request.json();

  // Dummy credentials
  const validPhone = "6281236261746";
  const validPassword = "Bahasa123";

  if (phone === validPhone && password === validPassword) {
    const response = NextResponse.json({ success: true });
    // Set a cookie to indicate the user is authenticated
    response.cookies.set("isAuthenticated", "true", {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });
    return response;
  }

  return NextResponse.json(
    { success: false, message: "Invalid credentials" },
    { status: 401 }
  );
}
