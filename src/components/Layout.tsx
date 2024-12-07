import { Home, DollarSign, Users, Brush, CalendarCheck, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Inicio" },
    { path: "/general-cleaning", icon: Brush, label: "Aseo" },
    { path: "/recurring-tasks", icon: CalendarCheck, label: "Tareas Periódicas" },
    { path: "/bills", icon: DollarSign, label: "Facturas" },
    { path: "/settings", icon: Settings, label: "Ajustes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">{children}</main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 z-40">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;