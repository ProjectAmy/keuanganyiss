import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
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