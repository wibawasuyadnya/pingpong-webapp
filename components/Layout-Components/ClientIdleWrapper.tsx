"use client";
import { SessionData } from "@/types/type";
import { useIdleLogoutHook } from "@/hook/useIdleLogoutHook";

interface ClientIdProps {
    session: SessionData;
}

const ClientIdleWrapper = ({ session }: ClientIdProps) => {
    useIdleLogoutHook({ session: session });
    return null;
};

export default ClientIdleWrapper;
