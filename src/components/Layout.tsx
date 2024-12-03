import { Bell, Home, DollarSign, CheckSquare, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: CheckSquare, label: "Tasks", path: "/tasks" },
    { icon: DollarSign, label: "Bills", path: "/bills" },
    { icon: Users, label: "Perfiles", path: "/profiles" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">{children}</main>
      
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 ${
                  isActive ? "text-primary" : "text-gray-500"
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