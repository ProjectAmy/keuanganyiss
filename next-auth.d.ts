import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            roles?: string[]
            id_token?: string
        } & DefaultSession["user"]
        api_token?: string
    }

    interface User {
        roles?: string[]
        api_token?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user_role?: string[]
        api_token?: string
        id_token?: string
    }
}
