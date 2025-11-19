import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { User } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 w-full h-16 flex items-center justify-end px-6 glass-panel border-b border-white/5">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full glass-button">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;