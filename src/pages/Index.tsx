import { Card } from "@/components/ui/card";
import { Brush, CheckSquare, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import useProfiles from "@/hooks/useProfiles";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const { profiles } = useProfiles();
  const features = [
    {
      title: "Aseo General",
      description: "Gestiona las tareas de limpieza general y asigna responsables.",
      path: "/general-cleaning",
      icon: Brush,
      color: "bg-blue-500"
    },
    {
      title: "Tareas Periódicas",
      description: "Administra las tareas recurrentes y su progreso.",
      path: "/recurring-tasks",
      icon: CheckSquare,
      color: "bg-green-500"
    },
    {
      title: "Facturas",
      description: "Controla los gastos y pagos compartidos.",
      path: "/bills",
      icon: DollarSign,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Household Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu hogar de manera eficiente
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} to={feature.path}>
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:scale-105 border-none bg-gradient-to-br from-background to-muted">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className={`p-3 rounded-full ${feature.color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${feature.color} text-opacity-90`} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {profiles.length === 0 && (
        <Card className="p-6 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">¡Importante!</h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            No hay perfiles creados. Para aprovechar todas las funciones de la aplicación,
            por favor <Link to="/settings" className="underline">crea algunos perfiles</Link> primero.
          </p>
        </Card>
      )}
    </div>
  );
};

export default Index;