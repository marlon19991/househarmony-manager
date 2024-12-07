import { Settings as SettingsIcon, Palette, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { CurrencySelector } from "@/components/Settings/CurrencySelector";
import { ProfilesSection } from "@/components/Settings/ProfilesSection";
import { useState } from "react";

const Settings = () => {
  const [currentSection, setCurrentSection] = useState<"profiles" | "currency">("profiles");

  const menuItems = [
    { id: "profiles" as const, label: "Perfiles", icon: SettingsIcon },
    { id: "currency" as const, label: "Moneda", icon: DollarSign },
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

          <main className="flex-1 p-6">
            <Card className="p-6">
              {currentSection === "profiles" && <ProfilesSection />}
              {currentSection === "currency" && <CurrencySelector />}
            </Card>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Settings;