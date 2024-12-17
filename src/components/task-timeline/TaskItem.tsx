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
import type { Task } from "./types";

interface TaskItemProps {
  task: Task;
  editingTask: number | null;
  onTaskChange: (taskId: number, field: keyof Task, value: any) => void;
  onRemoveTask: (taskId: number) => void;
  setEditingTask: (taskId: number | null) => void;
  team: string[];
  daysInMonth: number;
}

export function TaskItem({
  task,
  editingTask,
  onTaskChange,
  onRemoveTask,
  setEditingTask,
  team,
  daysInMonth,
}: TaskItemProps) {
  const taskWidth = ((task.end - task.start + 1) / daysInMonth) * 100;
  const taskOffset = ((task.start - 1) / daysInMonth) * 100;

  return (
    <div className="relative flex items-center gap-4 group min-h-[2.5rem]">
      <div className="w-64 flex items-center gap-2">
        {editingTask === task.id ? (
          <div className="flex items-center gap-2 w-full">
            <Input
              className="flex-1 h-8"
              value={task.label}
              onChange={(e) => onTaskChange(task.id, "label", e.target.value)}
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

      <div className="flex-1 relative h-8">
        <div
          className={cn(
            "absolute top-0 h-full rounded",
            task.color || "bg-blue-500"
          )}
          style={{
            width: `${taskWidth}%`,
            left: `${taskOffset}%`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <Select
              value={task.assignee}
              onValueChange={(value) => onTaskChange(task.id, "assignee", value)}
            >
              <SelectTrigger className="h-6 w-32">
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

            <Select
              value={task.completion_status}
              onValueChange={(value) =>
                onTaskChange(task.id, "completion_status", value)
              }
            >
              <SelectTrigger className="h-6 w-32">
                <SelectValue placeholder="Estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}