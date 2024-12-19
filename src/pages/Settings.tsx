import { Settings as SettingsIcon, Moon, Users } from "lucide-react";
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
import { GroupsSection } from "@/components/Settings/GroupsSection";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Settings = () => {
  const [currentSection, setCurrentSection] = useState<"profiles" | "appearance" | "groups">("profiles");
  const location = useLocation();

  useEffect(() => {
    if (location.state?.section) {
      setCurrentSection(location.state.section);
    }
  }, [location.state]);

  const menuItems = [
    { id: "profiles" as const, label: "Perfiles", icon: SettingsIcon },
    { id: "groups" as const, label: "Grupos", icon: Users },
    { id: "appearance" as const, label: "Apariencia", icon: Moon },
  ];

  return (
    <div className="container max-w-6xl mx-auto p-4 animate-fade-in">
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-10rem)] w-full">
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

          <main className="flex-1 p-6 relative z-0">
            <Card className="p-6">
              {currentSection === "profiles" && <ProfilesSection />}
              {currentSection === "groups" && <GroupsSection />}
              {currentSection === "appearance" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tema</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona el tema de la aplicación
                  </p>
                  <ThemeToggle />
                </div>
              )}
            </Card>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Settings;