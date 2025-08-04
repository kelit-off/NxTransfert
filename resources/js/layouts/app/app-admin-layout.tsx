import { AppContent } from "@/components/app-content";
import { AppShell } from "@/components/app-shell";
import { AppSidebar } from "@/components/app-sidebar";
import { AppSidebarHeader } from "@/components/app-sidebar-header";
import { BreadcrumbItem, NavItem } from "@/types";
import { ChartCandlestick } from "lucide-react";
import { PropsWithChildren } from "react";

const MainNavItem: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: ChartCandlestick,
    },
]

export default function AppAdminLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar PrinciaplNavIitem={MainNavItem}/>
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}