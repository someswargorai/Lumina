"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DynamicBreadcrumbs({ lastSegmentTitle }: { lastSegmentTitle?: string }) {
    const pathname = usePathname();
    const router = useRouter();

    if (!pathname) return null;

    const segments = pathname.split("/").filter((item) => item !== "" && item !== "(app)");

    const isMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    const filteredSegments = segments.filter((segment, index) => {
        // Skip IDs
        if (isMongoId(segment)) return false;
        // Skip segment after "profile"
        if (index > 0 && segments[index - 1] === "profile") return false;
        return true;
    });

    // Capitalize and format segments for display
    const formatSegment = (segment: string, isLast: boolean) => {
        if (isLast && lastSegmentTitle && !isMongoId(lastSegmentTitle)) return lastSegmentTitle;
        
        return segment
            .replace(/-/g, " ")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink 
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        onClick={() => router.push("/dashboard")}
                    >
                        <Home size={12} />
                        <span>Home</span>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {filteredSegments.map((segment, index) => {
                    const href = `/${segments.slice(0, segments.indexOf(segment) + 1).join("/")}`;
                    const isLast = index === filteredSegments.length - 1;

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbSeparator>
                                <ChevronRight size={12} className="text-slate-300" />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                                        {formatSegment(segment, true)}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink 
                                        className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer capitalize"
                                        onClick={() => router.push(href)}
                                    >
                                        {formatSegment(segment, false)}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
