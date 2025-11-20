import { memo, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Trash2, Pencil, Clock, Users, CheckCircle2, Camera, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RecurringTaskForm } from "./RecurringTaskForm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RecurringTask, RecurringTaskPayload } from "./hooks/useRecurringTasks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecurringTaskItemProps {
  task: RecurringTask;
  onDelete: (id: number) => void;
  onUpdate: (id: number, task: RecurringTaskPayload) => void;
  onComplete?: (taskId: number, evidenceUrl?: string) => void;
}

const RecurringTaskItemComponent = ({ task, onDelete, onUpdate, onComplete }: RecurringTaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isViewingEvidence, setIsViewingEvidence] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCompletedToday = useMemo(() => {
    if (!task.last_completion) return false;
    const completionDate = new Date(task.last_completion.completed_at);
    const today = new Date();
    return (
      completionDate.getDate() === today.getDate() &&
      completionDate.getMonth() === today.getMonth() &&
      completionDate.getFullYear() === today.getFullYear()
    );
  }, [task.last_completion]);

  const handleUpdate = (updatedTask: RecurringTaskPayload) => {
    onUpdate(task.id, updatedTask);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
    }
  };

  const handleComplete = async () => {
    if (!onComplete) return;

    let evidenceUrl = undefined;

    if (evidenceFile) {
      setIsUploading(true);
      try {
        const fileExt = evidenceFile.name.split('.').pop();
        const fileName = `recurring-${task.id}-${Date.now()}.${fileExt}`;
        const filePath = `recurring-tasks/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task-evidence')
          .upload(filePath, evidenceFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('task-evidence')
          .getPublicUrl(filePath);

        evidenceUrl = publicUrl;
      } catch (error) {
        console.error("Error uploading evidence:", error);
        toast.error("Error al subir la evidencia");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onComplete(task.id, evidenceUrl);
    setIsCompleting(false);
    setEvidenceFile(null);
  };

  const weekdaysText = useMemo(() => {
    if (!task.weekdays) return "";
    if (task.weekdays.every((day) => day)) {
      return "Todos los días";
    }
    if (
      task.weekdays[1] &&
      task.weekdays[2] &&
      task.weekdays[3] &&
      task.weekdays[4] &&
      task.weekdays[5] &&
      !task.weekdays[0] &&
      !task.weekdays[6]
    ) {
      return "De lunes a viernes";
    }

    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const selectedDays = task.weekdays
      .map((selected, index) => (selected ? days[index] : null))
      .filter(Boolean) as string[];

    if (!selectedDays.length) return "";
    if (selectedDays.length === 1) return `Cada ${selectedDays[0]}`;
    const lastDay = selectedDays.pop();
    return `${selectedDays.join(", ")} y ${lastDay}`;
  }, [task.weekdays]);

  const scheduleText = useMemo(() => {
    if (!task.recurrence_type) return "Sin programación";

    switch (task.recurrence_type) {
      case "specific":
        return task.start_date
          ? format(new Date(task.start_date), "PPP", { locale: es })
          : "Fecha no especificada";
      case "workdays":
        return "De lunes a viernes";
      case "weekly":
        return task.weekdays ? weekdaysText : "Sin días seleccionados";
      default:
        return "Sin programación";
    }
  }, [task.recurrence_type, task.start_date, task.weekdays, weekdaysText]);

  const formattedNotificationTime = useMemo(() => {
    if (!task.notification_time) return "";
    return format(new Date(`2000-01-01T${task.notification_time}`), "h:mm a");
  }, [task.notification_time]);

  const assigneesText = useMemo(() => {
    if (!task.assignees || task.assignees.length === 0) return "Sin asignados";
    if (task.assignees.length <= 3) {
      return task.assignees.join(", ");
    }
    return `${task.assignees.length} asignados`;
  }, [task.assignees]);

  if (isEditing) {
    return (
      <Card className="p-4">
        <RecurringTaskForm
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          initialData={{
            id: task.id,
            title: task.title,
            description: task.description || undefined,
            selectedAssignees: task.assignees || [],
            weekdays: task.weekdays || undefined,
            start_date: task.start_date ? new Date(task.start_date) : undefined,
            end_date: task.end_date ? new Date(task.end_date) : undefined,
            icon: task.icon || undefined,
            recurrence_type: task.recurrence_type,
            notification_time: task.notification_time || undefined
          }}
        />
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:bg-white/5 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold truncate">
              {task.title}
            </h3>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="flex-1 truncate">{scheduleText}</span>
            </div>

            {formattedNotificationTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formattedNotificationTime}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="flex-1 truncate">{assigneesText}</span>
            </div>

            {task.last_completion && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {isCompletedToday
                      ? `Completada hoy a las ${format(new Date(task.last_completion.completed_at), "h:mm a")}`
                      : `Última vez: ${format(new Date(task.last_completion.completed_at), "d MMM, h:mm a", { locale: es })}`
                    }
                  </span>
                </div>

                {task.last_completion.evidence_url && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs"
                    onClick={() => setIsViewingEvidence(true)}
                  >
                    <Camera className="h-3 w-3" />
                    Ver evidencia
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto justify-end">
          <TooltipProvider>
            {onComplete && (
              <Dialog open={isCompleting} onOpenChange={setIsCompleting}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-panel">
                  <DialogHeader>
                    <DialogTitle>Completar Tarea</DialogTitle>
                    <DialogDescription>
                      ¿Deseas registrar esta tarea como realizada? Puedes subir una foto como evidencia.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        {evidenceFile ? "Cambiar foto" : "Subir evidencia (opcional)"}
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </div>
                    {evidenceFile && (
                      <p className="text-sm text-muted-foreground">
                        Archivo seleccionado: {evidenceFile.name}
                      </p>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCompleting(false)}>Cancelar</Button>
                    <Button onClick={handleComplete} disabled={isUploading}>
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Registrar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditing(true)}
                  aria-label="Editar tarea"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar tarea</p>
              </TooltipContent>
            </Tooltip>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Eliminar tarea"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente la tarea recurrente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="w-full sm:w-auto"
                    onClick={() => onDelete(task.id)}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TooltipProvider>
        </div>
      </div>

      {/* Evidence Viewer Dialog */}
      <Dialog open={isViewingEvidence} onOpenChange={setIsViewingEvidence}>
        <DialogContent className="max-w-3xl glass-panel">
          <DialogHeader>
            <DialogTitle>Evidencia de la tarea</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {task.last_completion?.evidence_url ? (
              <img
                src={task.last_completion.evidence_url}
                alt="Evidencia"
                className="max-h-[60vh] rounded-lg object-contain"
              />
            ) : (
              <p>No hay evidencia disponible</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export const RecurringTaskItem = memo(RecurringTaskItemComponent);
RecurringTaskItem.displayName = "RecurringTaskItem";
