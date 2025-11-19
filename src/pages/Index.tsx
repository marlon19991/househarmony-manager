import { Card } from "@/components/ui/card";
import { Brush, CheckSquare, DollarSign, TrendingUp, Activity, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import useProfiles from "@/hooks/useProfiles";
import { cn } from "@/lib/utils";

const Index = () => {
  const { profiles } = useProfiles();

  const stats = [
    { label: "Total Tareas", value: "12", icon: CheckSquare, color: "text-blue-400" },
    { label: "Gastos del Mes", value: "$450", icon: DollarSign, color: "text-green-400" },
    { label: "Limpieza", value: "80%", icon: Brush, color: "text-purple-400" },
  ];

  const features = [
    {
      title: "Limpieza General",
      description: "Gestiona tareas de limpieza y asigna responsabilidades.",
      path: "/general-cleaning",
      icon: Brush,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400"
    },
    {
      title: "Tareas Periódicas",
      description: "Administra tareas recurrentes y su progreso.",
      path: "/recurring-tasks",
      icon: CheckSquare,
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400"
    },
    {
      title: "Gastos",
      description: "Controla gastos compartidos y pagos.",
      path: "/bills",
      icon: DollarSign,
      gradient: "from-emerald-500/20 to-green-500/20",
      iconColor: "text-emerald-400"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Panel de Control
          </h1>
          <p className="text-muted-foreground">
            Bienvenido a HouseHarmony. Aquí tienes un resumen de tu hogar.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass-card p-6 rounded-2xl flex items-center justify-between animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
            </div>
            <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions / Features */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Accesos Rápidos
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} to={feature.path} className="group">
                <div
                  className={cn(
                    "h-full p-6 rounded-2xl border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br",
                    feature.gradient
                  )}
                >
                  <div className="flex flex-col gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-background/50 backdrop-blur-sm border border-border/50", feature.iconColor)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Empty State Warning */}
      {profiles.length === 0 && (
        <div className="glass-panel p-6 rounded-xl border-l-4 border-amber-500 flex items-start gap-4">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-500 mb-1">Configuración Pendiente</h3>
            <p className="text-sm text-muted-foreground">
              Para aprovechar al máximo HouseHarmony, necesitas configurar los perfiles de los miembros del hogar.
              <Link to="/settings" className="text-primary hover:underline ml-1">
                Ir a Configuración
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;