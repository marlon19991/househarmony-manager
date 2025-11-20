export interface Task {
  id: number;
  description: string;
  completed: boolean;
  comment?: string;
  evidence_url?: string;
}