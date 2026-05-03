'use client';

import { Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-800/50 bg-white/40 dark:bg-neutral-900/40 pb-6">
          <CardTitle>Security &amp; Privacy</CardTitle>
          <CardDescription>Keep your account secure with these settings.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">

          {/* Password */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Change Password</h3>
            <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm text-neutral-600 dark:text-neutral-400 ">Current Password</label>
                <Input type="password" placeholder="••••••••" className="dark:bg-neutral-900/50 dark:border-neutral-800 mt-1 rounded-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-600 dark:text-neutral-400">New Password</label>
                <Input type="password" placeholder="••••••••" className="dark:bg-neutral-900/50 dark:border-neutral-800 mt-1 rounded-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-600 dark:text-neutral-400">Confirm New Password</label>
                <Input type="password" placeholder="••••••••" className="dark:bg-neutral-900/50 dark:border-neutral-800 mt-1 rounded-sm" />
              </div>
              <Button className="w-fit mt-2 rounded-sm shadow-[1px_2px_2px_0px_#66666640] dark:shadow-none ">Update Password</Button>
            </div>
          </div>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* 2FA */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30">
              <div className="flex gap-4 items-center">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full shrink-0">
                  <Key size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Authenticator App</h4>
                  <p className="text-sm text-neutral-500 mt-0.5">Use an app like Google Authenticator or Authy.</p>
                </div>
              </div>
              <Button variant="outline" className="dark:border-neutral-700 shrink-0 rounded-sm shadow-[1px_2px_2px_0px_#66666640] dark:shadow-none">Enable</Button>
            </div>
          </div>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* Active Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Active Sessions</h3>
            <div className="space-y-3">
              {[
                { device: 'Chrome on Windows', location: 'Mumbai, India', current: true },
                { device: 'Safari on iPhone', location: 'Mumbai, India', current: false },
              ].map((s) => (
                <div key={s.device} className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30">
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">{s.device}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{s.location}</p>
                  </div>
                  {s.current ? (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">Current</span>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 text-xs">Revoke</Button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
