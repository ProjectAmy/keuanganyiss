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
            },
            body: JSON.stringify({
              google_token: account.id_token,
            }),
          })

          if (res.ok) {
            return true
          }
        } catch (error) {
          console.error("Error during sign in check:", error)
        }
      }
      return false
    },
    async jwt({ token, account }) {
      if (account) {
        token.id_token = account.id_token
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id_token) {
        // @ts-ignore // Extending session type locally might be needed, but for now we force it
        session.user.id_token = token.id_token
      }
      return session
    },
  },
})