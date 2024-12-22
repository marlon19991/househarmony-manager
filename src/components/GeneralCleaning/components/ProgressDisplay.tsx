import { Progress } from "@/components/ui/progress";

interface ProgressDisplayProps {
  completionPercentage: number;
}

const ProgressDisplay = ({ completionPercentage }: ProgressDisplayProps) => {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Aseo General</h2>
      <Progress value={completionPercentage} className="w-full" />
      <p className="text-sm text-gray-500">
        Progreso: {completionPercentage.toFixed(0)}%
      </p>
    </div>
  );
};

export default ProgressDisplay;