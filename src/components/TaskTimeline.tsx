import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { TaskItem } from "./task-timeline/TaskItem";
import { format, addMonths, subMonths, getDaysInMonth } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import type { Task } from "./task-timeline/types";

interface TaskTimelineProps {
  projectId?: number;
}

const colors = [
  "bg-[#F97316]",
  "bg-[#0EA5E9]",
  "bg-[#22C55E]",
  "bg-[#6366F1]",
  "bg-[#D946EF]",
];

const team = ["Ana", "Bob", "Carlos", "Diana", "Elena"];

export function TaskTimeline({ projectId }: TaskTimelineProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = getDaysInMonth(currentDate);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;

      if (data) {
        const formattedTasks = data.map(task => ({
          id: task.id,
          label: task.label,
          color: task.color,
          start: task.start_time,
          end: task.end_time,
          assignee: task.assignee,
          completion_status: task.completion_status as 'pending' | 'in_progress' | 'completed'
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las tareas",
      });
    }
  };

  const handleAddTask = async () => {
    if (!projectId) return;

    try {
      const newTask = {
        project_id: projectId,
        label: "Nueva Tarea",
        color: colors[tasks.length % colors.length],
        start_time: 1,
        end_time: 3,
        assignee: team[0],
        completion_status: 'pending' as const,
      };

      const { data, error } = await supabase
        .from('project_tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const formattedTask = {
          id: data.id,
          label: data.label,
          color: data.color,
          start: data.start_time,
          end: data.end_time,
          assignee: data.assignee,
          completion_status: data.completion_status as 'pending' | 'in_progress' | 'completed'
        };
        setTasks([...tasks, formattedTask]);
        setEditingTask(data.id);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la tarea",
      });
    }
  };

  const handleRemoveTask = async (taskId: number) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
      setEditingTask(null);
      toast({
        title: "Éxito",
        description: "Tarea eliminada correctamente",
      });
    } catch (error) {
      console.error('Error removing task:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la tarea",
      });
    }
  };

  const handleTaskChange = async (taskId: number, field: keyof Task, value: any) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updateData = {
        [field === 'start' ? 'start_time' : field === 'end' ? 'end_time' : field]: value
      };

      const { error } = await supabase
        .from('project_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, [field]: value };
        }
        return task;
      }));
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la tarea",
      });
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  if (!projectId) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Selecciona un proyecto para ver sus tareas
      </div>
    );
  }

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