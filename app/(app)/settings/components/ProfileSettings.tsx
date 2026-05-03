'use client';

import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';

export default function ProfileSettings() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-800/50 bg-white/40 dark:bg-neutral-900/40 pb-6">
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>This is how others will see you on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-neutral-800 shadow-lg">
              <AvatarImage src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name}`} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {session?.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" className="dark:border-neutral-700 rounded-sm shadow-[1px_2px_2px_0px_#66666650] cursor-pointer">Change Avatar</Button>
              <p className="text-[10px] text-neutral-500">JPG, GIF or PNG. Max size of 800K</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-normal text-neutral-900 dark:text-neutral-200">Full Name</label>
              <Input defaultValue={session?.user?.name || ''} className="dark:bg-neutral-900/50 dark:border-neutral-800 focus-visible:ring-blue-500 rounded-sm mt-1" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-normal text-neutral-900 dark:text-neutral-200">Username</label>
              <Input defaultValue="@lumina_user" className="dark:bg-neutral-900/50 dark:border-neutral-800 focus-visible:ring-blue-500 rounded-sm mt-1" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-normal text-neutral-900 dark:text-neutral-200">Email</label>
              <Input defaultValue={session?.user?.email || ''} className="dark:bg-neutral-900/50 dark:border-neutral-800 focus-visible:ring-blue-500 rounded-sm mt-1" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-normal text-neutral-900 dark:text-neutral-200">Bio</label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 dark:bg-neutral-900/50 resize-none mt-1"
                placeholder="Tell us a little bit about yourself"
              ></textarea>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-neutral-50 dark:bg-neutral-950/30 border-t border-neutral-200 dark:border-neutral-800 px-6 py-4 flex justify-between items-center">
          <span className="text-sm text-neutral-500 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" /> Changes saved automatically
          </span>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-sm text-white shadow-[1px_2px_2px_0px_#84361140] font-normal border border-l-1 cursor-pointer">Save Changes</Button>
        </CardFooter>
      </Card>

      <Card className="border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden bg-white/50 dark:bg-neutral-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions regarding your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
            <div>
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Delete Account</h4>
              <p className="text-sm text-neutral-500 mt-1">Permanently delete your account and all data.</p>
            </div>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white rounded-sm shadow-[1px_2px_2px_0px_#84361140] cursor-pointer">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
