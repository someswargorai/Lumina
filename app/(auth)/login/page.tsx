"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Google from '@/app/constants/Google';
import Github from '@/app/constants/Github';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import Linkedin from '@/app/constants/Linkedin';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await signIn("credentials", {
        redirect: false,
        email,
        password,
        rememberMe,
      });

      if (response?.ok) {
        toast.success("Successfully signed in!");
        // dispatch(setUser(session)); // Placeholder for Redux
        globalThis.location.assign("/");
      } else {
        console.log(response);
        toast.error(response?.error || "Sign in failed");;
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'github' | 'linkedin') => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-12 sm:px-6 lg:px-8">
      <div
        // initial={{ opacity: 0, y: 20 }}
        // animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <Link href="/" className="inline-block text-4xl font-bold tracking-tighter text-slate-900">
            LUMINA
          </Link>
          <p className="mt-2 text-sm text-slate-600">
            Enter your credentials to access your publication
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialLogin('google')}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
            >
              <Google /> Google
            </button>
            <button
              onClick={() => handleSocialLogin('github')}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
            >
              <Github /> GitHub
            </button>
            <button
              onClick={() => handleSocialLogin('linkedin')}
              className="flex w-full items-center justify-center  gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
            >
              <Linkedin className="size-5" /> <span>LinkedIn</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-[#fafafa] px-4 text-slate-400">Or continue with</span>
            </div>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md">
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-slate-200 py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-0 sm:text-sm bg-white transition-all outline-none"
                  placeholder="Email address"
                  disabled={isLoading}
                />
              </div>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-slate-200 py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-0 sm:text-sm bg-white transition-all outline-none"
                  placeholder="Password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center ml-1">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-slate-900">
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <Link href="/auth/forgot-password" title="Forgot Password" className="font-normal hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center items-center gap-2 rounded-md bg-slate-900 px-4 py-4 text-sm font-normal text-white hover:bg-slate-800 focus:outline-none transition-all shadow-xl shadow-slate-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

