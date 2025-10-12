import { usePage } from '@inertiajs/react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { getAdminNavItems } from './admin-nav-items';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { NavUser } from '@/components/nav-user';

/**
 * Admin Sidebar Component
 * Navigation sidebar for admin panel with menu items and user profile
 * Styled to match the main app sidebar design
 */
export default function AdminSidebar() {
    const { url } = usePage();
    const navItems = getAdminNavItems(url);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Shield className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Admin Panel</span>
                                    <span className="text-xs text-muted-foreground">
                                        Management
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <hr className="my-2" />
                    <SidebarMenu>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={item.isActive}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href}>
                                            <Icon />
                                            <span>{item.title}</span>
                                            {item.badge !== undefined && (
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-auto"
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
