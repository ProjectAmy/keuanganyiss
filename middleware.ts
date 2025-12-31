import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req

    // Allow access to public routes (login page, static files, api)
    const isPublicRoute = nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/api") ||
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname.includes(".") // static files like images

    if (isPublicRoute) {
        // If logged in and at root, redirect to dashboard? 
        // The user didn't explicitly ask for this, but it's good UX.
        // However, the user specifically asked for:
        // 1. Not logged in -> visit dashboard -> redirect to home (which is /)
        // 2. Logged in (not staff) -> visit dashboard -> redirect to home
        return NextResponse.next()
    }

    // Protected routes logic
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/", nextUrl))
    }

    const userRoles = req.auth?.user?.roles || []
    // Check if any role matches "staff keuangan" (case insensitive)
    const isStaffKeuangan = userRoles.some(role =>
        role.toLowerCase() === "staff keuangan"
    )

    if (!isStaffKeuangan) {

        return NextResponse.redirect(new URL("/", nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
