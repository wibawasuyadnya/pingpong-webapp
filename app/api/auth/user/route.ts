import { getSession } from "@/lib/iron-config/session";
import { NextResponse } from "next/server";
import { encrypt } from "@/utils/sessionEncryption";

const helper = async (request: Request) => {
  const response = NextResponse.json({});
  const session = await getSession(request, response);

  if (session.isLoggedIn && session.user) {
    return NextResponse.json({
      isLoggedIn: true,
      picture: session.picture,
      user: await encrypt(JSON.stringify(session.user)),
    });
  }

  return NextResponse.json({
    isLoggedIn: false,
    picture: '',
    user: null,
  });
};

export { helper as GET };
