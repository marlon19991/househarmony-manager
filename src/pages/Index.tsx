import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      title: "Aseo General",
      description: "Gestiona las tareas de limpieza general y asigna responsables.",
      path: "/general-cleaning"
    },
    {
      title: "Tareas Diarias",
      description: "Administra las tareas del día a día y su progreso.",
      path: "/tasks"
    },
    {
      title: "Facturas",
      description: "Controla los gastos y pagos compartidos.",
      path: "/bills"
    },
    {
      title: "Perfiles",
      description: "Gestiona los perfiles de los miembros del hogar.",
      path: "/profiles"
    }
  ];

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bienvenido a Household Manager</h1>
        <Users className="w-6 h-6 text-gray-500" />
      </div>

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
        {features.map((feature) => (
          <Link key={feature.title} to={feature.path}>
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Index;