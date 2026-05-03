'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bell, Shield, CreditCard, Palette } from 'lucide-react';
import ProfileSettings from './components/ProfileSettings';
import AppearanceSettings from './components/AppearanceSettings';
import NotificationsSettings from './components/NotificationsSettings';
import SecuritySettings from './components/SecuritySettings';
import BillingSettings from './components/BillingSettings';
import { ScrollArea } from '@/components/ui/scroll-area';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <ScrollArea className="bg-neutral-50/50 dark:bg-black/50 p-6 md:p-10 lg:p-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            Settings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-500 dark:text-neutral-400 text-sm"
          >
            Manage your account settings and preferences.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-1/4 flex-shrink-0"
          >
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-md text-sm font-normal transition-all whitespace-nowrap cursor-pointer overflow-hidden ${isActive
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/50'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-blue-100/50 dark:bg-blue-900/20 rounded-md"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500'} />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </motion.aside>

          {/* Main Content Area */}
          <div className="lg:w-3/4 flex-1 mb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'appearance' && <AppearanceSettings />}
                {activeTab === 'notifications' && <NotificationsSettings />}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'billing' && <BillingSettings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </ScrollArea>
  );
}