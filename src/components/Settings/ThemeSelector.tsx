import { Check } from "lucide-react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";

const themes = [
  {
    name: "light",
    label: "Claro",
    colors: {
      primary: "#9b87f5",
      background: "#ffffff",
      card: "#f8f9fa",
      text: "#1a1f2c"
    }
  },
  {
    name: "dark",
    label: "Oscuro",
    colors: {
      primary: "#9b87f5",
      background: "#1a1f2c",
      card: "#242933",
      text: "#ffffff"
    }
  },
  {
    name: "purple",
    label: "Púrpura",
    colors: {
      primary: "#7e69ab",
      background: "#f8f7fd",
      card: "#ffffff",
      text: "#1a1f2c"
    }
  },
  {
    name: "dark-purple",
    label: "Púrpura Oscuro",
    colors: {
      primary: "#6e59a5",
      background: "#1a1f2c",
      card: "#242933",
      text: "#ffffff"
    }
  }
];

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className="w-full text-left"
          >
            <Card
              className={`relative p-4 transition-all duration-300 hover:scale-[1.02] ${
                theme === t.name
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:ring-1 hover:ring-primary/50"
              }`}
              style={{ background: t.colors.card }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className="font-medium"
                    style={{ color: t.colors.text }}
                  >
                    {t.label}
                  </span>
                  {theme === t.name && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: t.colors.primary }}
                    />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div
                    className="w-full h-6 rounded-full"
                    style={{ background: t.colors.primary }}
                  />
                  <div
                    className="w-full h-6 rounded-full"
                    style={{ background: t.colors.background }}
                  />
                  <div
                    className="w-full h-6 rounded-full"
                    style={{ background: t.colors.card }}
                  />
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
};