"use client";
import { User } from "@/types/type";
import { HeaderProvider } from "./headerProvider";

interface GetHeaderClientSideProps {
    user: string | User | null;
}

export default async function getHeaderClientSide({
    user,
}: GetHeaderClientSideProps) {
    let userToken = "";
    const apiKey = await HeaderProvider();

    if (user && typeof user === "object") {
        userToken = user.access_token || "";
    }

    console.log(user);

    const headers: { [key: string]: string } = {
        Accept: "application/json",
        "Api-Access-Key": `${apiKey.secret}`,
    };

    if (user) {
        headers["Authorization"] = `Bearer ${userToken}`;
    }

    return headers;
}
