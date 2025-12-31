import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { API_BASE_URL } from "@/lib/constants"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    error: "/",
  },
  callbacks: {
    async signIn({ account }) {
      if (account?.id_token) {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/check`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              google_token: account.id_token,
            }),
          })

          if (res.ok) {
            return true
          } else {

            return false
          }
        } catch (error) {

          return false
        }
      }
      return false
    },
    async jwt({ token, account }) {
      // 1. Capture Google ID Token if present (on initial sign in)
      if (account?.id_token) {
        token.id_token = account.id_token
      }

      // 2. If we have an ID token but no API token, try to fetch it from backend
      if (token.id_token && !token.api_token) {
        try {

          const res = await fetch(`${API_BASE_URL}/auth/check`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              google_token: token.id_token,
            }),
          })

          if (res.ok) {
            const data = await res.json()

            token.api_token = data.token
            token.user_role = data.roles
          } else {

          }
        } catch (error) {

        }
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id_token) {
        // @ts-ignore
        session.user.id_token = token.id_token
      }
      if (token?.api_token) {
        // @ts-ignore
        session.api_token = token.api_token
      }
      if (token?.user_role) {
        session.user.roles = token.user_role
      }
      return session
    },
  },
})