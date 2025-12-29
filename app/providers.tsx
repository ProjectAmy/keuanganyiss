"use client";

import { SessionProvider } from "next-auth/react";
import { AuthTokenSync } from "@/components/auth-token-sync";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthTokenSync />
            {children}
        </SessionProvider>
    );
}
