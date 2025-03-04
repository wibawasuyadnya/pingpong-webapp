import { destroySession } from "@/lib/iron-config/session";
import { NextResponse } from "next/server";

const helper = async (request: Request) => {
  try {
    const response = NextResponse.json({ success: true });

    await destroySession(request, response);

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
};

export { helper as DELETE };
