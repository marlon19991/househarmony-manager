import { Home, DollarSign, Brush, CalendarCheck, Settings, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const navItems = [
        { path: "/", icon: Home, label: "Dashboard" },
        { path: "/general-cleaning", icon: Brush, label: "Cleaning" },
        { path: "/recurring-tasks", icon: CalendarCheck, label: "Recurring" },
        { path: "/bills", icon: DollarSign, label: "Bills" },
        { path: "/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="glass-button rounded-full"
                >
                    {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out glass-panel border-r border-white/10",
                    isCollapsed && !isMobileOpen ? "w-20" : "w-64",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
                onMouseEnter={() => setIsCollapsed(false)}
                onMouseLeave={() => setIsCollapsed(true)}
            >
                <div className="flex flex-col h-full py-6">
                    {/* Header */}
                    <div className={cn("flex items-center px-6 mb-8", (isCollapsed && !isMobileOpen) ? "justify-center" : "justify-between")}>
                        {(!isCollapsed || isMobileOpen) && (
                            <h1 className="text-2xl font-bold text-gradient-primary truncate animate-fade-in">
                                HouseHarmony
                            </h1>
                        )}
                        {/* Mobile Close Button (only visible on mobile) */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden text-muted-foreground hover:text-primary"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(124,58,237,0.1)]"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                                        (isCollapsed && !isMobileOpen) && "justify-center px-2"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                    )}
                                    <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                                    {(!isCollapsed || isMobileOpen) && (
                                        <span className="font-medium tracking-wide animate-fade-in">{item.label}</span>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {(isCollapsed && !isMobileOpen) && (
                                        <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-border">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="px-4 mt-auto">
                        {(!isCollapsed || isMobileOpen) && (
                            <div className="glass-card p-4 rounded-xl animate-fade-in">
                                <p className="text-xs text-muted-foreground text-center">
                                    © 2024 HouseHarmony
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
