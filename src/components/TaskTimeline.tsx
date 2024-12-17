import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: number;
  label: string;
  color: string;
  start: number;
  end: number;
  assignee?: string;
  completion_status?: 'pending' | 'in_progress' | 'completed';
}

const defaultTasks = [
  { id: 1, label: "Interview", color: "bg-[#F97316]", start: 12, end: 13, assignee: "Ana", completion_status: 'completed' as const },
  { id: 2, label: "Ideate", color: "bg-[#0EA5E9]", start: 13, end: 15, assignee: "Bob", completion_status: 'in_progress' as const },
  { id: 3, label: "Wireframe", color: "bg-[#22C55E]", start: 15, end: 16, assignee: "Carlos", completion_status: 'pending' as const },
  { id: 4, label: "Evaluate", color: "bg-card", start: 16, end: 18, assignee: "Diana", completion_status: 'pending' as const },
];

const colors = [
  "bg-[#F97316]",
  "bg-[#0EA5E9]",
  "bg-[#22C55E]",
  "bg-[#6366F1]",
  "bg-[#D946EF]",
];

const team = ["Ana", "Bob", "Carlos", "Diana", "Elena"];

const statusColors = {
  pending: "text-yellow-500",
  in_progress: "text-blue-500",
  completed: "text-green-500",
};

export function TaskTimeline() {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [editingTask, setEditingTask] = useState<number | null>(null);

  const handleAddTask = () => {
    const newTask = {
      id: tasks.length + 1,
      label: "Nueva Tarea",
      color: colors[tasks.length % colors.length],
      start: 12,
      end: 13,
      assignee: team[0],
      completion_status: 'pending' as const,
    };
    setTasks([...tasks, newTask]);
    setEditingTask(newTask.id);
  };

  const handleRemoveTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setEditingTask(null);
  };

  const handleTaskChange = (taskId: number, field: keyof Task, value: any) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, [field]: value };
      }
      return task;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Línea de Tiempo</h3>
        <Button onClick={handleAddTask} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tarea
        </Button>
      </div>

      <div className="relative pt-4">
        <div className="flex justify-between mb-8">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="text-sm text-muted-foreground">
              {12 + i * 1}:00
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          {tasks.map((task) => {
            const startPosition = ((task.start - 12) / 6) * 100;
            const width = ((task.end - task.start) / 6) * 100;
            
            return (
              <div key={task.id} className="relative flex items-center gap-4 group">
                <div className="w-64 flex items-center gap-2">
                  {editingTask === task.id ? (
                    <>
                      <Input
                        className="flex-1 h-8"
                        value={task.label}
                        onChange={(e) => handleTaskChange(task.id, 'label', e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleRemoveTask(task.id)}
                      >
                        <Minus className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-sm font-medium truncate flex-1">
                      {task.label}
                    </span>
                  )}
                </div>

                <div className="w-48">
                  {editingTask === task.id ? (
                    <Select
                      value={task.assignee}
                      onValueChange={(value) => handleTaskChange(task.id, 'assignee', value)}
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
                        handleTaskChange(task.id, 'completion_status', value)
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
          })}
        </div>
      </div>
    </div>
  );
}