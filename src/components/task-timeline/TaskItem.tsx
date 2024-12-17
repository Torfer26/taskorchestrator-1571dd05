import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronDown, ChevronUp, Minus, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "./types";
import { useState } from "react";

interface TaskItemProps {
  task: Task;
  editingTask: number | null;
  onTaskChange: (taskId: number, field: keyof Task, value: any) => void;
  onRemoveTask: (taskId: number) => void;
  setEditingTask: (taskId: number | null) => void;
  team: string[];
  daysInMonth: number;
  isFirstDay: boolean;
}

export function TaskItem({
  task,
  editingTask,
  onTaskChange,
  onRemoveTask,
  setEditingTask,
  team,
  daysInMonth,
  isFirstDay,
}: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTaskClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingTask) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task.id);
  };

  // Solo mostrar la edición en el primer día de la tarea
  if (!isFirstDay && editingTask === task.id) {
    return null;
  }

  return (
    <div className="relative group">
      {editingTask === task.id && isFirstDay ? (
        <div className="flex items-center gap-1 p-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 rounded-md shadow-md">
          <Input
            className="h-6 text-xs"
            value={task.label}
            onChange={(e) => onTaskChange(task.id, "label", e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 hover:bg-green-100"
            onClick={(e) => {
              e.stopPropagation();
              setEditingTask(null);
            }}
          >
            <Check className="h-3 w-3 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTask(task.id);
            }}
          >
            <Minus className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "text-xs px-2 py-1 rounded cursor-pointer transition-all relative",
            task.color || "bg-blue-500",
            "text-white",
            isExpanded ? "hover:brightness-110" : "hover:brightness-90",
            editingTask === task.id && "ring-2 ring-primary"
          )}
          onClick={handleTaskClick}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{task.label}</span>
            {isFirstDay && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleEditClick}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {isExpanded && (
            <div className="mt-1 space-y-1 animate-fade-in">
              <Select
                value={task.assignee}
                onValueChange={(value) => onTaskChange(task.id, "assignee", value)}
              >
                <SelectTrigger className="h-6 w-full bg-white/10">
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
                <SelectTrigger className="h-6 w-full bg-white/10">
                  <SelectValue placeholder="Estado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}