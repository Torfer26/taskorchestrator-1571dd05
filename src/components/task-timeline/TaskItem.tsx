import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Minus, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task } from "./types";

interface TaskItemProps {
  task: Task;
  editingTask: number | null;
  onTaskChange: (taskId: number, field: keyof Task, value: any) => void;
  onRemoveTask: (taskId: number) => void;
  setEditingTask: (id: number | null) => void;
  team: string[];
}

export function TaskItem({
  task,
  editingTask,
  onTaskChange,
  onRemoveTask,
  setEditingTask,
  team,
}: TaskItemProps) {
  const startPosition = ((task.start - 12) / 6) * 100;
  const width = ((task.end - task.start) / 6) * 100;

  const statusColors = {
    pending: "text-yellow-500",
    in_progress: "text-blue-500",
    completed: "text-green-500",
  };

  return (
    <div className="relative flex items-center gap-4 group">
      <div className="w-64 flex items-center gap-2">
        {editingTask === task.id ? (
          <div className="flex items-center gap-2 w-full">
            <Input
              className="flex-1 h-8"
              value={task.label}
              onChange={(e) => onTaskChange(task.id, 'label', e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 hover:bg-green-100"
              onClick={() => setEditingTask(null)}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 hover:bg-destructive/10"
              onClick={() => onRemoveTask(task.id)}
            >
              <Minus className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm font-medium truncate flex-1">
              {task.label}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setEditingTask(task.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="w-48">
        {editingTask === task.id ? (
          <Select
            value={task.assignee}
            onValueChange={(value) => onTaskChange(task.id, 'assignee', value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Asignar a..." />
            </SelectTrigger>
            <SelectContent>
              {team.map((member) => (
                <SelectItem key={member} value={member}>
                  {member}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm text-muted-foreground">
            {task.assignee}
          </span>
        )}
      </div>

      <div className="w-48">
        {editingTask === task.id ? (
          <Select
            value={task.completion_status}
            onValueChange={(value: Task['completion_status']) => 
              onTaskChange(task.id, 'completion_status', value)
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Estado..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className={cn(
            "text-sm",
            statusColors[task.completion_status || 'pending']
          )}>
            {task.completion_status === 'pending' && 'Pendiente'}
            {task.completion_status === 'in_progress' && 'En Progreso'}
            {task.completion_status === 'completed' && 'Completado'}
          </span>
        )}
      </div>
      
      <div className="flex-1">
        <div
          className={cn(
            "h-8 rounded-full relative cursor-pointer transition-all",
            task.color,
            editingTask === task.id && "ring-2 ring-offset-2 ring-primary"
          )}
          style={{
            marginLeft: `${startPosition}%`,
            width: `${width}%`,
          }}
          onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
        >
          <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
            {task.label}
          </span>
        </div>
      </div>
    </div>
  );
}