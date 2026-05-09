import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import axios from "axios";
import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import NextAuthHandler from "next-auth/next";

type UserType = {
    id: string;
    name: string;
    email: string;
    token: string;
}

type CustomToken = {
    email?: string;
    name?: string;
    id?: string;
    accessToken: string;
}

export interface CustomSession extends DefaultSession {
    email?: string;
    name?: string;
    id?: string;
    accessToken: string;
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET as string,
            async profile(profile) {
                try {
                    const res = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/google-login`, { email: profile.email });

                    if (res?.data?.success) {
                        return {
                            id: res.data.data.user.id,
                            name: res.data.data.user.name,
                            email: res.data.data.user.email,
                            token: res.data.data.access_token
                        }
                    }
                    return res?.data;
                } catch (err) {
                    if (axios?.isAxiosError(err)) {
                        const message = err?.response?.data?.data;
                        throw new Error(message);
                    }
                }
            }
        }),
        GitHubProvider({
            clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID as string,
            clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET as string,
            async profile(profile) {
                try {
                    const res = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/google-login`, { email: profile.email });

                    if (res?.data?.success) {
                        return {
                            id: res.data.data.user.id,
                            name: res.data.data.user.name,
                            email: res.data.data.user.email,
                            token: res.data.data.access_token
                        }
                    }
                    return res?.data;
                } catch (err) {
                    if (axios?.isAxiosError(err)) {
                        const message = err?.response?.data?.data;
                        throw new Error(message);
                    }
                }
            }
        }),
        LinkedInProvider({
            clientId: process.env.Next_PUBLIC_LINKEDIN_CLIENT_ID as string,
            clientSecret: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET as string,
            async profile(profile) {
                try {
                    const res = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/google-login`, { email: profile.email });

                    if (res?.data?.success) {
                        return {
                            id: res.data.data.user.id,
                            name: res.data.data.user.name,
                            email: res.data.data.user.email,
                            token: res.data.data.access_token
                        }
                    }
                    return res?.data;
                } catch (err) {
                    if (axios?.isAxiosError(err)) {
                        const message = err?.response?.data?.data;
                        throw new Error(message);
                    }
                }
            }
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                },
                rememberMe: {
                    label: "Remember Me",
                    type: "checkbox"
                }
            },
            async authorize(credentials) {
                try {
                    const res = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/login`, { email: credentials?.email, password: credentials?.password });

                    if (res?.data?.success) {
                        return {
                            id: res.data.data.user.id,
                            name: res.data.data.user.name,
                            email: res.data.data.user.email,
                            token: res.data.data.access_token
                        }
                    }
                    return res?.data;
                } catch (err) {
                    if (axios?.isAxiosError(err)) {
                        const message = err?.response?.data?.data?.message;
                        throw new Error(message);
                    }
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const customUser = user as UserType;
                token.accessToken = customUser.token;
                token.id = customUser.id;
                token.name = customUser.name;
                token.email = customUser.email;
                return token;
            }
            return token;
        },
        async session({ session, token }) {

            const customSession = session as CustomSession;
            const customToken = token as CustomToken;

            customSession.email = customToken.email;
            customSession.name = customToken.name;
            customSession.id = customToken.id;
            customSession.accessToken = customToken.accessToken;
            return customSession;
        }
    },
    pages: {
        signIn: "/login"
    }
}


const handler = NextAuthHandler(authOptions);
export { handler as GET, handler as POST }