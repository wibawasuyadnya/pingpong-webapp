"use server";
import { secretKey } from "@/utils/envConfig";

export async function HeaderProvider() {
    const secret = secretKey;
    return { secret };
}
