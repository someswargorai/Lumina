"use server";

import { cookies } from "next/headers";

export async function saveToCookies<T>(key: string, value: T) {

    const cookieStore = await cookies();
    cookieStore.set(key, JSON.stringify(value), {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

}

export async function getFromCookies(key: string) {

    const cookieStore = await cookies();
    return cookieStore.get(key)?.value;

}