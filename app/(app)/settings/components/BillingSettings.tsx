'use client';

import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BillingSettings() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-blue-200 dark:border-blue-900/50 shadow-lg shadow-blue-500/5 overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-neutral-900/50">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-normal mb-3">
                Current Plan
              </div>
              <CardTitle className="text-2xl">Pro Workspace</CardTitle>
              <CardDescription className="mt-1">You have access to all premium features.</CardDescription>
            </div>
            <div className="text-right">
              <span className="text-3xl font-normal tracking-tight">$24</span>
              <span className="text-neutral-500 dark:text-neutral-400">/mo</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Storage Used</span>
              <span className="font-normal text-neutral-900 dark:text-neutral-100">45GB of 100GB</span>
            </div>
            <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '45%' }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-neutral-600 dark:text-neutral-400 text-sm!">Next Billing Date</span>
              <span className="font-normal text-neutral-900 dark:text-neutral-100 text-sm">June 1, 2026</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3 pt-6 border-t border-blue-100 dark:border-blue-900/30">
          <Button className="bg-black hover:bg-black text-white border-0 rounded-sm shadow-[1px_2px_2px_0px_#66666640] dark:shadow-none">Upgrade to Team</Button>
          <Button variant="outline" className="bg-white/50 dark:bg-transparent dark:border-neutral-700 rounded-sm shadow-[1px_2px_2px_0px_#66666640] dark:shadow-none">Cancel Plan</Button>
        </CardFooter>
      </Card>

      {/* Payment Methods */}
      <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white/50 dark:bg-neutral-900/50">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-8 bg-neutral-200 dark:bg-neutral-800 rounded flex items-center justify-center text-xs font-bold italic border border-neutral-300 dark:border-neutral-700">
                VISA
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Visa ending in 4242</h4>
                <p className="text-sm text-neutral-500 mt-0.5">Expires 12/2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">Default</span>
              <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Edit</Button>
            </div>
          </div>
          <Button variant="outline" className="w-full border-dashed dark:border-neutral-700">
            + Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white/50 dark:bg-neutral-900/50">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download past invoices for your records.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {[
              { date: 'May 1, 2026', amount: '$24.00', status: 'Paid' },
              { date: 'Apr 1, 2026', amount: '$24.00', status: 'Paid' },
              { date: 'Mar 1, 2026', amount: '$24.00', status: 'Paid' },
            ].map((invoice) => (
              <div key={invoice.date} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{invoice.date}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{invoice.amount}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">{invoice.status}</span>
                  <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
