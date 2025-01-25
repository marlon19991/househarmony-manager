import { Card } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const TaskLimitSection = () => {
  const { maxCleaningTasks, setMaxCleaningTasks } = useSettings();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Límite de Tareas de Limpieza</h3>
      <p className="text-sm text-muted-foreground">
        Selecciona el número máximo de tareas que se pueden crear en la sección de limpieza general
      </p>
      
      <RadioGroup
        value={maxCleaningTasks.toString()}
        onValueChange={(value) => setMaxCleaningTasks(parseInt(value))}
        className="grid grid-cols-3 gap-4"
      >
        {[10, 15, 20].map((limit) => {
          const isSelected = maxCleaningTasks === limit;
          return (
            <Card 
              key={limit} 
              className={cn(
                "relative cursor-pointer transition-all duration-200",
                isSelected && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <RadioGroupItem
                value={limit.toString()}
                id={`limit-${limit}`}
                className="sr-only"
              />
              <Label
                htmlFor={`limit-${limit}`}
                className="block p-4 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-2xl font-semibold block text-center">
                      {limit}
                    </span>
                    <span className="text-sm text-muted-foreground text-center block">
                      tareas
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              </Label>
            </Card>
          );
        })}
      </RadioGroup>
    </div>
  );
}; 