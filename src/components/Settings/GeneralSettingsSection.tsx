import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCleaningSettings } from "@/stores/cleaningSettings";

export const GeneralSettingsSection = () => {
  const { maxTasks, setMaxTasks } = useCleaningSettings();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Configuración General</h3>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Límite de Tareas de Aseo</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Establece el número máximo de tareas que se pueden crear en la sección de aseo general
              </p>
              <RadioGroup
                value={maxTasks.toString()}
                onValueChange={(value) => setMaxTasks(parseInt(value))}
                className="grid grid-cols-3 gap-4"
              >
                {[10, 15, 20].map((value) => (
                  <div key={value}>
                    <RadioGroupItem
                      value={value.toString()}
                      id={`tasks-${value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`tasks-${value}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="text-2xl font-semibold">{value}</span>
                      <span className="text-sm">tareas</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}; 