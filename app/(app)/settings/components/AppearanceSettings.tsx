'use client';

import { Laptop } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  

  return (
    <div className="space-y-6">
      <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-sm">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-800/50 bg-white/40 dark:bg-neutral-900/40 pb-6">
          <CardTitle>Theme Preferences</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${theme === 'light' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-neutral-200 dark:border-neutral-800 hover:border-blue-300'}`}
            >
              <div className="w-full h-24 rounded-md bg-[#f8fafc] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                <div className="h-4 bg-white border-b border-neutral-200 flex items-center px-2 gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex-1 p-2 flex gap-2">
                  <div className="w-1/4 h-full bg-neutral-200/50 rounded-sm"></div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="w-full h-2 bg-blue-100 rounded-sm"></div>
                    <div className="w-3/4 h-2 bg-neutral-200 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300">Light Mode</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${theme === 'dark' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-neutral-200 dark:border-neutral-800 hover:border-blue-300'}`}
            >
              <div className="w-full h-24 rounded-md bg-[#0f172a] border border-neutral-700 shadow-sm overflow-hidden flex flex-col">
                <div className="h-4 bg-neutral-900 border-b border-neutral-800 flex items-center px-2 gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <div className="flex-1 p-2 flex gap-2">
                  <div className="w-1/4 h-full bg-neutral-800 rounded-sm"></div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="w-full h-2 bg-blue-900/50 rounded-sm"></div>
                    <div className="w-3/4 h-2 bg-neutral-800 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300">Dark Mode</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${theme === 'system' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-neutral-200 dark:border-neutral-800 hover:border-blue-300'}`}
            >
              <div className="w-full h-24 rounded-md bg-gradient-to-r from-[#f8fafc] to-[#0f172a] border border-neutral-300 dark:border-neutral-700 shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                  <Laptop className="h-8 w-8 text-neutral-500 mix-blend-difference" />
                </div>
              </div>
              <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300">System</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white/50 dark:bg-neutral-900/50 rounded-sm">
        <CardHeader className="pb-4">
          <CardTitle>Display Density</CardTitle>
          <CardDescription>Adjust how much information is shown on screen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30">
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Compact Mode</h4>
              <p className="text-sm text-neutral-500 mt-1">Reduces padding and font size to show more content.</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30">
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Reduced Motion</h4>
              <p className="text-sm text-neutral-500 mt-1">Disables animations and transitions across the UI.</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
