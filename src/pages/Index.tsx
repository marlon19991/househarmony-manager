import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "sonner";
import GeneralCleaningSection from "@/components/GeneralCleaning/GeneralCleaningSection";
import useProfiles from "@/hooks/useProfiles";

// Separar la sección de tareas en su propio componente
const TasksSection = () => {
  const { profiles } = useProfiles();
  const [tasks, setTasks] = useState([
    { id: 1, title: "Limpiar cocina", assignee: "Juan", dueDate: "Hoy", status: "pending" },
    { id: 2, title: "Sacar la basura", assignee: "Sara", dueDate: "Hoy", status: "completed" },
    { id: 3, title: "Aspirar sala", assignee: "Miguel", dueDate: "Mañana", status: "pending" },
  ]);
  const [newTask, setNewTask] = useState({ title: "", assignee: "" });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assignee) {
      toast.error("Por favor completa todos los campos de la tarea");
      return;
    }

    const task = {
      id: tasks.length + 1,
      title: newTask.title,
      assignee: newTask.assignee,
      dueDate: "Hoy",
      status: "pending"
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", assignee: "" });
    toast.success("Tarea agregada exitosamente");
  };

  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === "completed" ? "pending" : "completed";
        toast.success(`Tarea marcada como ${newStatus === "completed" ? "completada" : "pendiente"}`);
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Tareas de Hoy</h2>
      <form onSubmit={handleAddTask} className="mb-4 space-y-4">
        <div>
          <Label htmlFor="taskTitle">Nueva Tarea</Label>
          <Input
            id="taskTitle"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Título de la tarea"
          />
        </div>
        <div>
          <Label htmlFor="taskAssignee">Asignar a</Label>
          <Select onValueChange={(value) => setNewTask({ ...newTask, assignee: value })} value={newTask.assignee}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar responsable" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.name}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={profile.icon} alt={profile.name} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    {profile.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">Agregar Tarea</Button>
      </form>
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-500">Asignado a {task.assignee}</p>
              </div>
              <button 
                onClick={() => toggleTaskStatus(task.id)}
                className="focus:outline-none"
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

// Separar la sección de facturas en su propio componente
const BillsSection = () => {
  const { profiles } = useProfiles();
  const [bills, setBills] = useState([
    { id: 1, title: "Electricidad", amount: 120, dueDate: "25 Marzo", status: "pending" },
    { id: 2, title: "Internet", amount: 80, dueDate: "28 Marzo", status: "paid" },
    { id: 3, title: "Agua", amount: 60, dueDate: "1 Abril", status: "pending" },
  ]);
  const [newBill, setNewBill] = useState({ title: "", amount: "" });

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.title || !newBill.amount) {
      toast.error("Por favor completa todos los campos de la factura");
      return;
    }

    const bill = {
      id: bills.length + 1,
      title: newBill.title,
      amount: parseFloat(newBill.amount),
      dueDate: "Próximo mes",
      status: "pending"
    };

    setBills([...bills, bill]);
    setNewBill({ title: "", amount: "" });
    toast.success("Factura agregada exitosamente");
  };

  const toggleBillStatus = (billId: number) => {
    setBills(bills.map(bill => {
      if (bill.id === billId) {
        const newStatus = bill.status === "paid" ? "pending" : "paid";
        toast.success(`Factura marcada como ${newStatus === "paid" ? "pagada" : "pendiente"}`);
        return { ...bill, status: newStatus };
      }
      return bill;
    }));
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Facturas Próximas</h2>
      <form onSubmit={handleAddBill} className="mb-4 space-y-4">
        <div>
          <Label htmlFor="billTitle">Nueva Factura</Label>
          <Input
            id="billTitle"
            value={newBill.title}
            onChange={(e) => setNewBill({ ...newBill, title: e.target.value })}
            placeholder="Título de la factura"
          />
        </div>
        <div>
          <Label htmlFor="billAmount">Monto</Label>
          <Input
            id="billAmount"
            type="number"
            value={newBill.amount}
            onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
            placeholder="Monto de la factura"
          />
        </div>
        <Button type="submit" className="w-full">Agregar Factura</Button>
      </form>
      <div className="space-y-3">
        {bills.map((bill) => (
          <Card key={bill.id} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{bill.title}</h3>
                <p className="text-sm text-gray-500">Vence {bill.dueDate}</p>
              </div>
              <div className="text-right">
                <button 
                  onClick={() => toggleBillStatus(bill.id)}
                  className="focus:outline-none"
                >
                  <p className="font-medium">${bill.amount}</p>
                  <p className={`text-xs ${bill.status === "paid" ? "text-green-500" : "text-amber-500"}`}>
                    {bill.status === "paid" ? "Pagado" : "Pendiente"}
                  </p>
                </button>
                <p className="text-xs text-gray-500">${(bill.amount / profiles.length).toFixed(2)} por persona</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

const Index = () => {
  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Panel de Control</h1>
        <Users className="w-6 h-6 text-gray-500" />
      </div>

      <GeneralCleaningSection />

      <div className="space-y-6">
        <TasksSection />
        <BillsSection />
      </div>
    </div>
  );
};

export default Index;