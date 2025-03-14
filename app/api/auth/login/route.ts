import { NextResponse } from "next/server";
import { setSession } from "@/lib/iron-config/session";

const helper = async (request: Request) => {
  try {
    const { name, email, phone_number, access_token, picture } =
      await request.json();


    const response = NextResponse.json({ success: true });

    await setSession(request, response, {
      user: {
        name,
        email,
        phone_number,
        access_token,
      },
      picture: picture,
      isLoggedIn: true,
    });

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
};

export { helper as POST };
