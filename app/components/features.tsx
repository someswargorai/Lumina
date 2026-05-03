"use client";

import { motion } from 'motion/react';
import { Palette, Share2, BarChart3, ShieldCheck, Globe, Users } from 'lucide-react';

const features = [
  {
    title: 'Editorial Control',
    description: 'Precision typography and layout tools designed for high-resolution storytelling.',
    icon: Palette,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    title: 'Global Distribution',
    description: 'One-click publishing to our network and lightning-fast worldwide delivery.',
    icon: Globe,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Advanced Analytics',
    description: 'Deep insights into reader behavior without compromising user privacy.',
    icon: BarChart3,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Custom Subscriptions',
    description: 'Built-in tools to monetize your audience with flexible paid tiers.',
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'Privacy First',
    description: 'Zero trackers, GDPR-compliant by design, and owned by you, always.',
    icon: ShieldCheck,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    title: 'Seamless Integrations',
    description: 'Connect with your favorite tools via our robust API and marketplace.',
    icon: Share2,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24 sm:py-32" id='features'>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 max-w-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">The Lumina Advantage</h2>
          <p className="serif mt-4 text-4xl font-bold text-slate-950 sm:text-5xl">
            Everything you need to build a digital legacy.
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-3xl border border-slate-100 p-8 transition-all hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100"
            >
              <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.bg} ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="serif text-xl font-bold text-slate-950">{feature.title}</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
