import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Users } from "lucide-react";

const Index = () => {
  const tasks = [
    { id: 1, title: "Clean kitchen", assignee: "John", dueDate: "Today", status: "pending" },
    { id: 2, title: "Take out trash", assignee: "Sarah", dueDate: "Today", status: "completed" },
    { id: 3, title: "Vacuum living room", assignee: "Mike", dueDate: "Tomorrow", status: "pending" },
  ];

  const bills = [
    { id: 1, title: "Electricity", amount: 120, dueDate: "March 25", status: "pending" },
    { id: 2, title: "Internet", amount: 80, dueDate: "March 28", status: "paid" },
    { id: 3, title: "Water", amount: 60, dueDate: "April 1", status: "pending" },
  ];

  return (
    <div className="container max-w-md mx-auto p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Home Dashboard</h1>
        <Users className="w-6 h-6 text-gray-500" />
      </div>

      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Task Progress</h2>
        <Progress value={33} className="mb-2" />
        <div className="flex justify-between text-sm text-gray-500">
          <span>2 pending</span>
          <span>1 completed</span>
        </div>
      </Card>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-3">Today's Tasks</h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-500">Assigned to {task.assignee}</p>
                  </div>
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Upcoming Bills</h2>
          <div className="space-y-3">
            {bills.map((bill) => (
              <Card key={bill.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{bill.title}</h3>
                    <p className="text-sm text-gray-500">Due {bill.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${bill.amount}</p>
                    <p className="text-xs text-gray-500">${(bill.amount / 4).toFixed(2)} per person</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;