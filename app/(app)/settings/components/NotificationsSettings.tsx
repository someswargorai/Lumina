'use client';

import { Globe, AlertCircle, Smartphone, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const notificationItems = [
  {
    icon: Globe, 
    iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-9 h-9',
    title: 'Web Notifications',
    description: "Receive push notifications in your browser when you're active on the platform.",
    defaultChecked: true,
  },
  {
    icon: Mail,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 w-9 h-9',
    title: 'Email Alerts',
    description: 'Get daily digests and important account alerts sent to your inbox.',
    defaultChecked: true,
  },
  {
    icon: Smartphone,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 w-9 h-9',
    title: 'Mobile Push',
    description: 'Receive push notifications on your mobile device via the Lumina app.',
    defaultChecked: false,
  },
  {
    icon: AlertCircle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 w-9 h-9',
    title: 'Activity Digest',
    description: 'Weekly summary of your workspace activity and highlights.',
    defaultChecked: true,
  },
];

export default function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-800/50 bg-white/40 dark:bg-neutral-900/40 pb-6">
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Control how and when you want to be notified.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {notificationItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-2.5 flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className={`mt-1 p-2 rounded-sm shrink-0 ${item.iconBg}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-neutral-900 dark:text-neutral-100">{item.title}</h4>
                      <p className="text-sm text-neutral-500 mt-1 max-w-lg">{item.description}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
