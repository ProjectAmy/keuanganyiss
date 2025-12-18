"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface TokenHandlerProps {
    token: string;
    redirectTo: string;
}

export default function TokenHandler({ token, redirectTo }: TokenHandlerProps) {
    const router = useRouter();

    useEffect(() => {
        if (token) {
            // Store in both Cookie and LocalStorage for flexibility
            Cookies.set("auth_token", token, { expires: 7 }); // 7 days
            localStorage.setItem("auth_token", token);

            // Redirect after storing
            router.replace(redirectTo);
        } else {
            // Fallback if no token (shouldn't happen based on parent logic)
            router.replace("/login");
        }
    }, [token, redirectTo, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Menyimpan sesi...</span>
        </div>
    );
}
