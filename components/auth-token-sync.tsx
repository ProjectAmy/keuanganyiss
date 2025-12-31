"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function AuthTokenSync() {
    const { data: session } = useSession();

    useEffect(() => {
        // @ts-ignore
        const token = session?.api_token;

        if (token) {
            localStorage.setItem("auth_token", token);

        } else {

        }
    }, [session]);

    return null;
}
