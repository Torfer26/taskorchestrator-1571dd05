import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskItem } from "./task-timeline/TaskItem";
import { TimelineHeader } from "./task-timeline/TimelineHeader";
import type { Task } from "./task-timeline/types";

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
        <TimelineHeader startHour={12} duration={6} />
        
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              editingTask={editingTask}
              onTaskChange={handleTaskChange}
              onRemoveTask={handleRemoveTask}
              setEditingTask={setEditingTask}
              team={team}
            />
          ))}
        </div>
      </div>
    </div>
  );
}