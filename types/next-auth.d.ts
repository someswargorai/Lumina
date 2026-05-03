import  { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    id?: string;
    user: {
      id?: string;
    } & DefaultSession["user"]
  }

  interface User {
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}
