import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, Minus, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "./types";
import { useState } from "react";
import { format } from "date-fns";

interface TaskBarProps {
  task: Task;
  editingTask: number | null;
  onTaskChange: (taskId: number, field: keyof Task, value: any) => void;
  onRemoveTask: (taskId: number) => void;
  setEditingTask: (taskId: number | null) => void;
  team: string[];
  daysInMonth: number;
  startDay: number;
  duration: number;
}

export function TaskBar({
  task,
  editingTask,
  onTaskChange,
  onRemoveTask,
  setEditingTask,
  team,
  daysInMonth,
  startDay,
  duration,
}: TaskBarProps) {
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

  return (
    <div 
      className={cn(
        "absolute top-1 left-0 right-0 mx-1",
        "transition-all duration-200"
      )}
      style={{
        gridColumn: `span ${duration}`,
        gridColumnStart: startDay,
      }}
    >
      {editingTask === task.id ? (
        <div className="flex flex-col gap-2 p-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 rounded-md shadow-md">
          <div className="flex items-center gap-1">
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
          
          <div className="flex gap-2 items-center">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1 text-xs">
              <Input
                type="date"
                className="h-6"
                value={task.start_date}
                onChange={(e) => onTaskChange(task.id, "start_date", e.target.value)}
              />
              <Input
                type="date"
                className="h-6"
                value={task.end_date}
                onChange={(e) => onTaskChange(task.id, "end_date", e.target.value)}
              />
            </div>
          </div>

          <Select
            value={task.assignee}
            onValueChange={(value) => onTaskChange(task.id, "assignee", value)}
          >
            <SelectTrigger className="h-6 text-xs">
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
            <SelectTrigger className="h-6 text-xs">
              <SelectValue placeholder="Estado..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div
          className={cn(
            "text-xs px-2 py-1 rounded cursor-pointer transition-all relative h-full",
            task.color || "bg-blue-500",
            "text-white",
            isExpanded ? "hover:brightness-110" : "hover:brightness-90"
          )}
          onClick={handleTaskClick}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{task.label}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleEditClick}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
          
          {isExpanded && (
            <div className="mt-1 space-y-1 animate-fade-in">
              <div className="text-xs opacity-75">
                {format(new Date(task.start_date), 'dd/MM/yyyy')} - {format(new Date(task.end_date), 'dd/MM/yyyy')}
              </div>
              <div className="text-xs opacity-75">
                Asignado a: {task.assignee}
              </div>
              {task.dependencies && (
                <div className="text-xs opacity-75">
                  Depende de: {task.dependencies}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}