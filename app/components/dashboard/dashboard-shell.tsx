/** @format */
"use client";

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {usePathname} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {signOut} from "@/lib/controller/auth/auth-controller";
import {
    LayoutDashboard,
    Users,
    LucideBuilding2,
    LucideBriefcase,
    Settings,
    Briefcase,
    FileText,
    Building2,
    LogOut,
    Menu,
    X,
    PanelLeftClose,
    PanelLeftOpen,
    FolderKanban,
    FileCheck,
    type LucideIcon,
} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type {User} from "@/lib/domain/user";
import type {Config} from "@/lib/domain/config";
import type {NavItem} from "@/lib/utils/navigation";
import {cn} from "@/lib/utils";

/**
 * Maps navigation paths to their corresponding Lucide icons.
 * This lookup table ensures consistent iconography across the application's navigation.
 */
const ICON_MAP: Record<string, LucideIcon> = {
    "/dashboard": LayoutDashboard,
    "/dashboard/administrator/users": Users,
    "/dashboard/administrator/organizations": LucideBuilding2,
    "/dashboard/administrator/projects": LucideBriefcase,
    "/dashboard/projects": FolderKanban,
    "/dashboard/opportunities": Briefcase,
    "/dashboard/completions": FileCheck,
    "/dashboard/applications": FileText,
    "/dashboard/organization/profile": Building2,
    "/dashboard/settings": Settings,
};

/**
 * Props for the DashboardShell component.
 */
interface DashboardShellProps {
    /** The authenticated user session data. used for profile display. */
    user: User;
    /** Application configuration settings (branding, logos, etc.). */
    config: Config | null;
    /** List of navigation items authorized for the current user's role. */
    navItems: NavItem[];
    /** The page content to be rendered within the shell layout. */
    children: React.ReactNode;
}

/**
 * Standardized CSS classes for tooltip content.
 *
 * Enforces a strict, minimal visual style:
 * - High contrast (foreground text on background color)
 * - No border or arrows (clean, floating look)
 * - Small, bold typography for quick readability
 */
const TOOLTIP_CONTENT_CLASS =
    "ml-2 bg-foreground text-background border-none rounded-md shadow-xl px-3 py-1.5 text-xs font-semibold [&_span]:hidden [&_svg]:hidden";

/**
 * The primary layout shell for the dashboard interface.
 *
 * This component provides a responsive, collapsible sidebar navigation system that adapts
 * between desktop and mobile viewports. It handles:
 *
 * - **Responsive Navigation**: A persistent sidebar on desktop (expandable/collapsible) and a slide-out drawer on mobile.
 * - **State Management**: Tracks sidebar collapse state and mobile menu visibility.
 * - **Role-Based Routing**: Renders navigation links dynamically based on the provided `navItems`.
 * - **User Context**: Displays the current user's profile and provides a logout mechanism.
 * - **Branding**: Integrates the organization's logo and name from the global config.
 */
export function DashboardShell({user, config, navItems, children,}: DashboardShellProps) {
    const t = useTranslations("dashboard");
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const initials = user.name?.charAt(0)?.toUpperCase() || "U";

    const handleSignOut = async () => {
        await signOut();
    };

    const normalizedPath = pathname.replace(/^\/[a-z]{2}(\-[A-Z]{2})?/, "") || "/";

    const renderNavLink = (item: NavItem, isCollapsed: boolean, onItemClick?: () => void) => {
        const Icon = ICON_MAP[item.href] || LayoutDashboard;

        const isActive =
            normalizedPath === item.href ||
            (item.href !== "/" && item.href !== "/dashboard" && normalizedPath.startsWith(item.href));

        const title = t.has(`nav.${item.titleKey}`) ? t(`nav.${item.titleKey}`) : item.titleKey;

        const LinkContent = (
            <Link
                href={item.href}
                onClick={onItemClick}
                className={cn(
                    "relative flex items-center rounded-lg transition-all duration-200 ease-in-out group",
                    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isCollapsed ? "justify-center p-3 mx-2" : "gap-3 px-4 py-3 mx-3",
                    isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
            >
                {!isCollapsed && isActive && (
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full"
                        aria-hidden="true"
                    />
                )}

                <Icon
                    className={cn(
                        "shrink-0 h-5 w-5 transition-colors duration-200",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                />

                <span
                    className={cn(
                        "font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out",
                        isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                    )}
                >
                    {title}
                </span>

                {isCollapsed && isActive && (
                    <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary border-2 border-background"/>
                )}
            </Link>
        );

        if (isCollapsed) {
            return (
                <Tooltip delayDuration={0} key={item.href}>
                    <TooltipTrigger asChild>{LinkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10} className={TOOLTIP_CONTENT_CLASS}>
                        {title}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return <React.Fragment key={item.href}>{LinkContent}</React.Fragment>;
    };

    return (
        <TooltipProvider>
            <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
                <aside
                    className={cn(
                        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-30",
                        "border-r border-border bg-card",
                        "transition-[width] duration-300 ease-in-out",
                        collapsed ? "lg:w-20" : "lg:w-72"
                    )}
                >
                    <div className={cn(
                        "flex flex-col border-b border-border bg-muted/5 transition-all duration-300 ease-in-out overflow-hidden",
                        collapsed ? "h-20 justify-center items-center" : "h-auto py-4 items-center"
                    )}>
                        {!collapsed && (
                            <div className="flex flex-col items-center w-full animate-in fade-in duration-300 px-4">
                                {config?.logo ? (
                                    <div className="relative h-20 w-full">
                                        <Image
                                            src={config.logo}
                                            alt={config.name}
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                                        <Building2 className="h-8 w-8 text-primary"/>
                                    </div>
                                )}
                            </div>
                        )}

                        {collapsed && (
                            <div className="flex items-center justify-center animate-in fade-in zoom-in duration-300">
                                {config?.logo ? (
                                    <div className="relative h-8 w-8">
                                        <Image src={config.logo} alt="Icon" fill className="object-contain"/>
                                    </div>
                                ) : (
                                    <Building2 className="h-6 w-6 text-primary"/>
                                )}
                            </div>
                        )}
                    </div>

                    <nav className="flex-1 py-6 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-none">
                        {navItems.map((item) => renderNavLink(item, collapsed))}
                    </nav>

                    <div className="px-3 pt-3 pb-3 border-t border-border bg-muted/5">
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Link
                                    href="/dashboard/profile"
                                    className={cn(
                                        "flex items-center rounded-lg transition-all duration-200",
                                        "hover:bg-muted/50 border border-transparent",
                                        collapsed ? "justify-center p-2" : "gap-3 p-2 hover:border-border/50"
                                    )}
                                >
                                    <Avatar className="h-9 w-9 border border-border overflow-hidden">
                                        <AvatarImage
                                            src={user.profilePictureUrl || undefined}
                                            className="h-full w-full object-cover"
                                            alt={initials}
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "min-w-0 transition-all duration-300",
                                        collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                                    )}>
                                        <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                    </div>
                                </Link>
                            </TooltipTrigger>
                            {collapsed && (
                                <TooltipContent side="right" sideOffset={10} className={TOOLTIP_CONTENT_CLASS}>
                                    {t("user.profile")}
                                </TooltipContent>
                            )}
                        </Tooltip>

                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={handleSignOut}
                                    className={cn(
                                        "mt-1 flex w-full items-center text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200",
                                        collapsed ? "justify-center p-2" : "gap-3 p-2"
                                    )}
                                >
                                    <LogOut className="h-4 w-4 shrink-0"/>
                                    <span className={cn(
                                        "text-sm font-medium transition-all duration-300",
                                        collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                                    )}>
                                        {t("user.logout")}
                                    </span>
                                </button>
                            </TooltipTrigger>
                            {collapsed && (
                                <TooltipContent side="right" sideOffset={10} className={TOOLTIP_CONTENT_CLASS}>
                                    {t("user.logout")}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </div>

                    <div className="border-t border-border p-2 bg-muted/5">
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setCollapsed(!collapsed)}
                                    className={cn(
                                        "flex w-full items-center justify-center rounded-md h-9 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors",
                                        !collapsed && "justify-between px-3"
                                    )}
                                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                                >
                                    {!collapsed && (
                                        <span
                                            className="text-sm font-medium">{t("nav.collapse", {default: "Collapse sidebar"})}</span>
                                    )}
                                    {collapsed ? <PanelLeftOpen className="h-4 w-4"/> :
                                        <PanelLeftClose className="h-4 w-4"/>}
                                </button>
                            </TooltipTrigger>
                            {collapsed && (
                                <TooltipContent side="right" sideOffset={10} className={TOOLTIP_CONTENT_CLASS}>
                                    {t("nav.expand", {default: "Expand sidebar"})}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </div>
                </aside>

                {mobileOpen && (
                    <div className="fixed inset-0 z-40 bg-background backdrop-blur-sm lg:hidden"
                         onClick={() => setMobileOpen(false)}/>
                )}

                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl lg:hidden",
                        "transform transition-transform duration-300 ease-out",
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="flex flex-col p-6 border-b border-border bg-muted/5">
                        <div className="flex items-center justify-between mb-6">
                            <div className="relative h-10 w-10 shrink-0">
                                {config?.logo ? (
                                    <Image src={config.logo} alt="Logo" fill className="object-contain"/>
                                ) : (
                                    <Building2 className="h-10 w-10 text-primary"/>
                                )}
                            </div>
                            <button onClick={() => setMobileOpen(false)}
                                    className="p-2 -mr-2 text-muted-foreground hover:bg-muted/50 rounded-lg">
                                <X className="h-5 w-5"/>
                            </button>
                        </div>
                        <span className="font-bold text-xl text-foreground leading-tight px-1">
                            {config?.name || "Dashboard"}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                        {navItems.map((item) => renderNavLink(item, false, () => setMobileOpen(false)))}
                    </div>

                    <div className="p-4 border-t border-border bg-muted/5">
                        <Link href="/dashboard/profile"
                              className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <Avatar className="h-10 w-10 border border-border">
                                <AvatarImage src={user.profilePictureUrl || undefined}/>
                                <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <div className="font-medium text-foreground truncate">{user.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                            </div>
                        </Link>
                        <button onClick={handleSignOut}
                                className="flex w-full items-center justify-center gap-2 p-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                            <LogOut className="h-4 w-4"/>
                            {t("user.logout")}
                        </button>
                    </div>
                </aside>

                <main
                    className={cn(
                        "flex-1 flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out bg-muted/10",
                        collapsed ? "lg:ml-20" : "lg:ml-72"
                    )}
                >
                    <header
                        className="sticky top-0 z-20 flex h-16 items-center gap-4 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
                        <button onClick={() => setMobileOpen(true)}
                                className="p-2 -ml-2 text-muted-foreground hover:bg-muted/50 rounded-lg">
                            <Menu className="h-6 w-6"/>
                        </button>
                        <span className="font-semibold text-foreground truncate">
                            {config?.name || "Dashboard"}
                        </span>
                    </header>

                    <div
                        className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}
