import { Settings as SettingsIcon, Moon, ClipboardList, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfilesSection } from "@/components/Settings/ProfilesSection";
import { TaskLimitSection } from "@/components/Settings/TaskLimitSection";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Section = "profiles" | "appearance" | "tasks";

const Settings = () => {
  const [currentSection, setCurrentSection] = useState<Section>("profiles");

  const menuItems = [
    { id: "profiles" as const, label: "Perfiles", icon: User },
    { id: "appearance" as const, label: "Apariencia", icon: Moon },
    { id: "tasks" as const, label: "Tareas", icon: ClipboardList },
  ];

  const renderContent = () => {
    switch (currentSection) {
      case "profiles":
        return <ProfilesSection />;
      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Tema de la Aplicación</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Personaliza cómo se ve HouseHarmony en tu dispositivo.
              </p>
              <div className="flex items-center gap-4 p-4 rounded-xl glass-panel border border-white/5">
                <span className="text-sm font-medium">Modo Oscuro / Claro</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        );
      case "tasks":
        return <TaskLimitSection />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Administra tus preferencias y configuración de la cuenta.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <nav className="w-full md:w-64 flex-shrink-0 space-y-2">
          {menuItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left",
                  isActive
                    ? "bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          <div className="glass-card p-6 rounded-2xl border border-white/5 min-h-[400px]">
            <div className="mb-6 pb-6 border-b border-white/5">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                {menuItems.find(item => item.id === currentSection)?.icon && (
                  <SettingsIcon className="w-5 h-5 text-primary" />
                )}
                {menuItems.find(item => item.id === currentSection)?.label}
              </h2>
            </div>
            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;