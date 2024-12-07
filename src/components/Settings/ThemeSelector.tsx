import { Check } from "lucide-react";
import { useTheme } from "next-themes";

const themes = [
  { name: "light", label: "Claro", colors: { primary: "#9b87f5", background: "#ffffff" } },
  { name: "dark", label: "Oscuro", colors: { primary: "#9b87f5", background: "#1a1f2c" } },
  { name: "purple", label: "Púrpura", colors: { primary: "#7e69ab", background: "#f8f7fd" } },
  { name: "dark-purple", label: "Púrpura Oscuro", colors: { primary: "#6e59a5", background: "#1a1f2c" } },
];

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Selecciona un tema</h3>
      <div className="grid grid-cols-2 gap-4">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={`relative p-4 rounded-lg border transition-all ${
              theme === t.name
                ? "border-primary ring-2 ring-primary ring-offset-2"
                : "border-border hover:border-primary"
            }`}
            style={{ background: t.colors.background }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: t.colors.primary }}
              />
              <span
                className={
                  t.name.includes("dark") ? "text-white" : "text-gray-900"
                }
              >
                {t.label}
              </span>
            </div>
            {theme === t.name && (
              <Check
                className={`absolute top-2 right-2 w-4 h-4 ${
                  t.name.includes("dark") ? "text-white" : "text-primary"
                }`}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};