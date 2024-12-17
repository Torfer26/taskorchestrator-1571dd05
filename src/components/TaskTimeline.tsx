import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { TaskItem } from "./task-timeline/TaskItem";
import { TimelineHeader } from "./task-timeline/TimelineHeader";
import type { Task } from "./task-timeline/types";
import { format, addMonths, subMonths, getDaysInMonth } from "date-fns";
import { es } from "date-fns/locale";

const defaultTasks = [
  { id: 1, label: "Entrevista", color: "bg-[#F97316]", start: 1, end: 3, assignee: "Ana", completion_status: 'completed' as const },
  { id: 2, label: "Ideación", color: "bg-[#0EA5E9]", start: 4, end: 7, assignee: "Bob", completion_status: 'in_progress' as const },
  { id: 3, label: "Wireframe", color: "bg-[#22C55E]", start: 8, end: 10, assignee: "Carlos", completion_status: 'pending' as const },
  { id: 4, label: "Evaluación", color: "bg-card", start: 11, end: 15, assignee: "Diana", completion_status: 'pending' as const },
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = getDaysInMonth(currentDate);

  const handleAddTask = () => {
    const newTask = {
      id: tasks.length + 1,
      label: "Nueva Tarea",
      color: colors[tasks.length % colors.length],
      start: 1,
      end: 3,
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

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center h-16 px-4 border-b">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-lg font-medium"
            onClick={() => setCurrentDate(new Date())}
          >
            Hoy
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-32 text-center">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button onClick={handleAddTask} size="sm" className="bg-[#F97316] hover:bg-[#F97316]/90">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tarea
        </Button>
      </div>

      <div className="grid grid-cols-7 border-b text-sm text-muted-foreground">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <div key={day} className="px-2 py-3 text-center font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr gap-[1px] bg-muted">
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
          const dayTasks = tasks.filter(task => 
            task.start <= (i + 1) && task.end >= (i + 1)
          );

          return (
            <div 
              key={i} 
              className="min-h-[120px] bg-background p-1 relative group hover:bg-muted/50 transition-colors"
              onClick={() => setEditingTask(null)}
            >
              <div className="text-sm p-1">
                {i + 1}
              </div>
              <div className="space-y-1">
                {dayTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    editingTask={editingTask}
                    onTaskChange={handleTaskChange}
                    onRemoveTask={handleRemoveTask}
                    setEditingTask={setEditingTask}
                    team={team}
                    daysInMonth={daysInMonth}
                    isFirstDay={task.start === (i + 1)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}