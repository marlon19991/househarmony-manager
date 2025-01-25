import { Settings as SettingsIcon, Moon, ClipboardList, Menu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ProfilesSection } from "@/components/Settings/ProfilesSection";
import { TaskLimitSection } from "@/components/Settings/TaskLimitSection";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Section = "profiles" | "appearance" | "tasks";

const Settings = () => {
  const [currentSection, setCurrentSection] = useState<Section>("profiles");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "profiles" as const, label: "Perfiles", icon: SettingsIcon },
    { id: "appearance" as const, label: "Apariencia", icon: Moon },
    { id: "tasks" as const, label: "Tareas", icon: ClipboardList },
  ];

  const handleMenuItemClick = (sectionId: Section) => {
    setCurrentSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (currentSection) {
      case "profiles":
        return <ProfilesSection />;
      case "appearance":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tema</h3>
            <p className="text-sm text-muted-foreground">
              Selecciona el tema de la aplicación
            </p>
            <ThemeToggle />
          </div>
        );
      case "tasks":
        return <TaskLimitSection />;
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 animate-fade-in">
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-10rem)] w-full flex-col sm:flex-row">
          {/* Menú móvil */}
          <div className="block sm:hidden mb-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="w-full flex items-center justify-center gap-2">
                  <Menu className="h-4 w-4" />
                  <span>Menú de Ajustes</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[340px]">
                <div className="px-2 py-4">
                  <h2 className="text-lg font-semibold">Ajustes</h2>
                </div>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => handleMenuItemClick(item.id)}
                        data-active={currentSection === item.id}
                        className="w-full"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SheetContent>
            </Sheet>
          </div>

          {/* Sidebar desktop */}
          <div className="hidden sm:block">
            <Sidebar>
              <SidebarHeader className="px-2 py-4">
                <h2 className="text-lg font-semibold">Ajustes</h2>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setCurrentSection(item.id)}
                        data-active={currentSection === item.id}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
          </div>

          {/* Contenido principal */}
          <main className="flex-1 sm:p-6 relative z-0">
            <Card className="p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl font-semibold">
                  {menuItems.find(item => item.id === currentSection)?.label}
                </h2>
              </div>
              {renderContent()}
            </Card>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Settings;