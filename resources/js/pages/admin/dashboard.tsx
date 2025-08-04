import AppStatsCard from "@/components/app-statscard";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import AppAdminLayout from "@/layouts/app/app-admin-layout";
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";

export default function DashBoard() {
    const { statsTrasnfertNonExpire } = usePage<SharedData>().props
    return (
        <AppAdminLayout>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="h-full flex flex-1 flex-col justify-center items-center">
                            <h2 className="text-lg font-semibold mb-4 opacity-90">Total Transfert Actif</h2>
                            <span className="text-5xl md:text-6xl font-bold">{statsTrasnfertNonExpire}</span>
                            <p className="text-lg opacity-90">transferts non expirés</p>
                        </div>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppAdminLayout>
    )
}