import { Link } from '@inertiajs/react';
import {
    Activity,
    CalendarDays,
    Droplets,
    FileText,
    LayoutGrid,
    NotebookPen,
    Pill,
    Siren,
    Table2,
    Utensils,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Lab Results',
        href: '/lab-results',
        icon: Activity,
    },
    {
        title: 'Medications',
        href: '/medications',
        icon: Pill,
    },
    {
        title: 'Diet & Fluid',
        href: '/intake',
        icon: Utensils,
    },
    {
        title: 'Symptoms',
        href: '/symptoms',
        icon: NotebookPen,
    },
    {
        title: 'Dialysis',
        href: '/dialysis',
        icon: Droplets,
    },
    {
        title: 'Appointments',
        href: '/appointments',
        icon: CalendarDays,
    },
    {
        title: 'Reference',
        href: '/reference',
        icon: Table2,
    },
    {
        title: 'Report',
        href: '/report',
        icon: FileText,
    },
    {
        title: 'Emergency',
        href: '/emergency',
        icon: Siren,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
