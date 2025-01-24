import { User } from "@/types/type";
import { IncomingMessage } from "http";
import { cookies } from "next/headers";
import { getIronOptions } from "./ironOptions";
import { getIronSession, IronSession, IronSessionData } from "iron-session";

declare module "iron-session" {
  interface IronSessionData {
    user?: User;
    isLoggedIn?: boolean;
    timerStartTime: number;
  }
}

// Helper function to retrieve a session
export const getSession = async (
  req: Request | IncomingMessage,
  res: Response
): Promise<IronSession<IronSessionData>> => {
  const ironOptions = await getIronOptions();  
  const session = await getIronSession<IronSessionData>(
    req,
    res,
    ironOptions 
  );
  return session;
};

// Helper function to retrieve session server side
export const getServerActionSession = async () => {
  const ironOptions = await getIronOptions();  
  const session = await getIronSession<IronSessionData>(
    await cookies(),  
    ironOptions  
  );
  return session;
};

// Helper function to set session data
export const setSession = async (
  req: Request,
  res: Response,
  sessionData: Partial<IronSessionData>
): Promise<void> => {
  const ironOptions = await getIronOptions(); 
  const session = await getIronSession<IronSessionData>(
    req,
    res,
    ironOptions  
  );

  Object.assign(session, sessionData);

  // Save the session
  await session.save();
};

// Helper function to delete session data
export const destroySession = async (
  request: Request,
  response: Response
): Promise<void> => {
  const ironOptions = await getIronOptions(); 
  const session = await getIronSession<IronSessionData>(
    request,
    response,
    ironOptions  
  );
  session.destroy();
};

// Helper function to delete session server side
export const deleteServerActionSession = async () => {
  const ironOptions = await getIronOptions();  
  const session = await getIronSession<IronSessionData>(
    await cookies(),
    ironOptions  
  );
  session.destroy();
};
