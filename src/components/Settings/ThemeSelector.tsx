import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex justify-center gap-6">
      <button
        onClick={() => setTheme("light")}
        className="group"
      >
        <Card
          className={`relative p-8 transition-all duration-300 hover:scale-105 ${
            theme === "light"
              ? "ring-2 ring-primary ring-offset-2 bg-background"
              : "hover:ring-1 hover:ring-primary/50 bg-background/50"
          }`}
        >
          <Sun 
            className={`w-16 h-16 transition-colors duration-300 ${
              theme === "light" ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </Card>
      </button>

      <button
        onClick={() => setTheme("dark")}
        className="group"
      >
        <Card
          className={`relative p-8 transition-all duration-300 hover:scale-105 ${
            theme === "dark"
              ? "ring-2 ring-primary ring-offset-2 bg-background"
              : "hover:ring-1 hover:ring-primary/50 bg-background/50"
          }`}
        >
          <Moon 
            className={`w-16 h-16 transition-colors duration-300 ${
              theme === "dark" ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </Card>
      </button>
    </div>
  );
};