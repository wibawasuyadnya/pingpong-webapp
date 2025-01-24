// types/next.d.ts
import { Session } from "@/utils/withSession";
import { NextApiRequest, GetServerSidePropsContext } from "next";
import { NextResponse } from "next/server";

declare module "next" {
  interface NextApiRequest {
    session: Session;
  }

  interface GetServerSidePropsContext {
    req: NextApiRequest;
    res: NextResponse;
  }
}
