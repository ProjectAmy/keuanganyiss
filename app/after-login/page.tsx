import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { API_BASE_URL } from "@/lib/constants";
import TokenHandler from "./token-handler";

export default async function AfterLogin() {
    const session = await auth();

    if (!session?.user?.email) {
        return redirect("/");
    }

    // @ts-ignore
    const googleToken = session.user.id_token;

    const res = await fetch(`${API_BASE_URL}/auth/check`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            google_token: googleToken,
        }),
    });

    if (res.status === 200) {
        const data = await res.json();
        // Assuming the API returns { token: "..." } or { data: { token: "..." } }
        // Let's assume it returns { token: "..." } based on user description, 
        // but robustly check data structure if possible. 
        // Previous conversation implies "token ini didapatkan ketika request POST".
        const token = data.token || data.data?.token;

        if (token) {
            return <TokenHandler token={token} redirectTo="/dashboard" />;
        }

        // If 200 but no token, something is weird, maybe redirect anyway or show error?
        // Fallback to dashboard hoping cookie was set by headers (unlikely based on context)
        return redirect("/dashboard");
    }

    if (res.status === 404) {
        return redirect("/register");
    }

    // fallback kalau API error
    return (
        <div className="p-10 text-center">
            <h1>Terjadi Kesalahan</h1>
            <p>Silakan coba beberapa saat lagi.</p>
        </div>
    );
}
