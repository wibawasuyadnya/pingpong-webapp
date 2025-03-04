import { getSession } from "@/lib/iron-config/session";
import { NextResponse } from "next/server";

const helper = async (request: Request) => {
  const response = NextResponse.json({});
  const session = await getSession(request, response);

  if (session.isLoggedIn && session.user) {
    return NextResponse.json({
      isLoggedIn: true,
      user: session.user,
    });
  }

  return NextResponse.json({
    isLoggedIn: false,
    user: null,
  });
};

export { helper as GET };
