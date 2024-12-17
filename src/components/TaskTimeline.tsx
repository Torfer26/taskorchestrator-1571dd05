import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

interface Task {
  id: number;
  label: string;
  color: string;
  start: number;
  end: number;
}

const defaultTasks = [
  { id: 1, label: "Interview", color: "bg-[#F97316]", start: 12, end: 13 },
  { id: 2, label: "Ideate", color: "bg-[#0EA5E9]", start: 13, end: 15 },
  { id: 3, label: "Wireframe", color: "bg-[#22C55E]", start: 15, end: 16 },
  { id: 4, label: "Evaluate", color: "bg-card", start: 16, end: 18 },
];

const colors = [
  "bg-[#F97316]",
  "bg-[#0EA5E9]",
  "bg-[#22C55E]",
  "bg-[#6366F1]",
  "bg-[#D946EF]",
];

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
              <div key={task.id} className="relative group">
                {editingTask === task.id ? (
                  <div className="absolute -left-40 top-0 bottom-0 flex items-center gap-2">
                    <Input
                      className="w-32 h-8"
                      value={task.label}
                      onChange={(e) => handleTaskChange(task.id, 'label', e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveTask(task.id)}
                    >
                      <Minus className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="absolute -left-40 top-0 bottom-0 flex items-center">
                    <span className="text-sm font-medium w-32 truncate">
                      {task.label}
                    </span>
                  </div>
                )}
                
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
            );
          })}
        </div>
      </div>
    </div>
  );
}