"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function AuthTokenSync() {
    const { data: session } = useSession();

    useEffect(() => {
        // @ts-ignore
        const token = session?.api_token;
        console.log("🔄 Syncing token. Session has token:", !!token);
        if (token) {
            localStorage.setItem("auth_token", token);
            console.log("✅ Token saved to localStorage");
        } else {
            console.warn("⚠️ No token found in session to sync");
        }
    }, [session]);

    return null;
}
