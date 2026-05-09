"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProfilePageSkeleton() {
    return (
        <ScrollArea className="h-full">
            <div className="max-w-6xl mx-auto pb-20">

                {/* ── Cover / Header ── */}
                <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800 relative" />

                {/* ── Profile Content ── */}
                <div className="px-6 sm:px-8 -mt-16">

                    {/* Row: avatar (overlapping cover) + action buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">

                        {/* Avatar — 128×128, border-4 border-white, same as original */}
                        <Skeleton className="w-32 h-32 rounded-full border-4 border-white dark:border-black shadow-xl flex-shrink-0" />

                        {/* Action buttons row */}
                        <div className="flex items-center gap-3 pb-2">
                            {/* Follow / Edit Profile button */}
                            <Skeleton className="h-10 w-32 rounded-full" />
                            {/* Message icon button */}
                            <Skeleton className="h-10 w-10 rounded-full" />
                            {/* MoreHorizontal icon button */}
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                    </div>

                    {/* ── Bio Section ── */}
                    <div className="mt-8 flex flex-col gap-1">
                        {/* Name + verified badge row */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-52 rounded-md" />   {/* text-3xl font-black */}
                            <Skeleton className="h-5 w-5 rounded-full" />  {/* verified badge */}
                        </div>
                        {/* @username */}
                        <Skeleton className="h-5 w-32 rounded-md mt-1" />
                    </div>

                    {/* ── Bio paragraph ── */}
                    <div className="mt-4 flex flex-col gap-2">
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-4/5 rounded" />
                        <Skeleton className="h-4 w-3/5 rounded" />
                    </div>

                    {/* ── Metadata row (location · website · joined) ── */}
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                        {/* MapPin + city, country */}
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-28 rounded" />
                        </div>
                        {/* LinkIcon + website */}
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-24 rounded" />
                        </div>
                        {/* Calendar + joined */}
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-28 rounded" />
                        </div>
                    </div>

                    {/* ── Stats row ── */}
                    <div className="mt-6 flex gap-6 pb-10 border-b border-slate-100 dark:border-neutral-800">
                        {/* Following */}
                        <div className="flex gap-1.5 items-center">
                            <Skeleton className="h-5 w-8 rounded" />   {/* bold count */}
                            <Skeleton className="h-4 w-16 rounded" />  {/* "Following" label */}
                        </div>
                        {/* Followers */}
                        <div className="flex gap-1.5 items-center">
                            <Skeleton className="h-5 w-8 rounded" />
                            <Skeleton className="h-4 w-16 rounded" />
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="mt-8">
                        <div className="flex gap-8 border-b border-slate-100 dark:border-neutral-800 mb-6">
                            {/* Articles tab */}
                            <Skeleton className="h-5 w-16 rounded mb-4" />
                            {/* Saved tab */}
                            <Skeleton className="h-5 w-12 rounded mb-4" />
                        </div>

                        {/* ── Post card skeletons — matches the original [1,2].map pulse ── */}
                        <div className="flex flex-col gap-4">
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="flex flex-col gap-4 py-6 border-b border-slate-100 dark:border-neutral-800"
                                >
                                    {/* Author row: avatar + name + date */}
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                                        <div className="flex flex-col gap-1.5">
                                            <Skeleton className="h-4 w-28 rounded" />
                                            <Skeleton className="h-3 w-20 rounded" />
                                        </div>
                                    </div>

                                    {/* Title — matches "h-8 w-3/4" in original */}
                                    <Skeleton className="h-8 w-3/4 rounded" />

                                    {/* Excerpt — matches "h-20 w-full" in original */}
                                    <Skeleton className="h-20 w-full rounded" />

                                    {/* Tags row */}
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                        <Skeleton className="h-5 w-14 rounded-full" />
                                    </div>

                                    {/* Footer: read time + likes + comments */}
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-4 w-16 rounded" />
                                        <Skeleton className="h-4 w-12 rounded" />
                                        <Skeleton className="h-4 w-12 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}