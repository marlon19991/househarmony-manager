import { Card } from "@/components/ui/card";
import { Users, Brush, CheckSquare, DollarSign } from "lucide-react";
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
      icon: Brush
    },
    {
      title: "Tareas Diarias",
      description: "Administra las tareas del día a día y su progreso.",
      path: "/tasks",
      icon: CheckSquare
    },
    {
      title: "Facturas",
      description: "Controla los gastos y pagos compartidos.",
      path: "/bills",
      icon: DollarSign
    },
    {
      title: "Perfiles",
      description: "Gestiona los perfiles de los miembros del hogar.",
      path: "/profiles",
      icon: Users
    }
  ];

  // Mock data for general cleaning progress - this should be replaced with actual data from your state management
  const generalCleaningAssignee = "Juan";
  const completionPercentage = 75;

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bienvenido a Household Manager</h1>
        <Users className="w-6 h-6 text-gray-500" />
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Estado del Aseo General
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Responsable actual:</p>
            <p className="font-medium">{generalCleaningAssignee}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
          </div>
          <Link 
            to="/general-cleaning"
            className="block text-center text-sm text-primary hover:underline mt-2"
          >
            Ver detalles del aseo general
          </Link>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Tu asistente para la gestión del hogar
        </h2>
        <p className="text-gray-600 mb-6">
          Esta aplicación te ayuda a organizar las tareas del hogar, gestionar gastos
          compartidos y coordinar con otros miembros de la casa de manera eficiente.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} to={feature.path}>
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {profiles.length === 0 && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-2">¡Importante!</h3>
          <p className="text-sm text-amber-700">
            No hay perfiles creados. Para aprovechar todas las funciones de la aplicación,
            por favor <Link to="/profiles" className="underline">crea algunos perfiles</Link> primero.
          </p>
        </Card>
      )}
    </div>
  );
};

export default Index;