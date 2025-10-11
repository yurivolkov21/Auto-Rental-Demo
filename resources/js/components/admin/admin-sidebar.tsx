import { usePage } from '@inertiajs/react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { getAdminNavItems } from './admin-nav-items';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

/**
 * Admin Sidebar Component
 * Navigation sidebar for admin panel with menu items
 */
export default function AdminSidebar() {
    const { url } = usePage();
    const navItems = getAdminNavItems(url);

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">Admin Panel</span>
                        <span className="text-xs text-muted-foreground">Management</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={item.isActive}
                                            tooltip={item.title}
                                        >
                                            <a href={item.href}>
                                                <Icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                                {item.badge !== undefined && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="ml-auto"
                                                    >
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t px-6 py-4">
                <div className="text-xs text-muted-foreground">
                    <p>AutoRental Admin v1.0</p>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
