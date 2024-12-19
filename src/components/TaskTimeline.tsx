import { useState, useEffect } from "react";
import { getDaysInMonth, subMonths, addMonths, format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import type { Task, RawTask } from "./task-timeline/types";
import { TimelineHeader } from "./task-timeline/TimelineHeader";
import { TimelineGrid } from "./task-timeline/TimelineGrid";
import { convertJsonToTasks, defaultTasks } from "./task-timeline/taskUtils";

interface TaskTimelineProps {
  projectId?: number;
  initialTasks?: string;
}

const team = [
  "Gestor de Proyectos",
  "Equipo Técnico",
  "Técnico de Implementación",
  "Arquitecto de Soluciones",
  "Administrador de Sistemas",
  "Técnico de Redes",
  "Especialista en Sistemas",
  "Especialista en Backup",
  "Tester de QA",
  "Documentador Técnico",
  "Formador"
];

export function TaskTimeline({ projectId, initialTasks }: TaskTimelineProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = getDaysInMonth(currentDate);
  const { toast } = useToast();

  useEffect(() => {
    if (initialTasks) {
      try {
        const parsedTasks = JSON.parse(initialTasks);
        const convertedTasks = convertJsonToTasks(parsedTasks, currentDate);
        setTasks(convertedTasks);
      } catch (error) {
        console.error('Error parsing initial tasks:', error);
      }
    } else if (projectId) {
      fetchTasks();
    }
  }, [projectId, initialTasks, currentDate]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedTasks = data.map(task => ({
          id: task.id,
          label: task.label,
          color: task.color,
          start: task.start_time,
          end: task.end_time,
          assignee: task.assignee,
          completion_status: task.completion_status as 'pending' | 'in_progress' | 'completed',
          dependencies: task.dependencies || '',
          start_date: task.start_date || '',
          end_date: task.end_date || '',
          duration: task.duration || 1
        }));
        setTasks(formattedTasks);
      } else {
        // If no tasks exist, create default tasks
        const convertedTasks = convertJsonToTasks(defaultTasks, currentDate);
        createDefaultTasks(convertedTasks);
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

  const createDefaultTasks = async (defaultTasks: Task[]) => {
    try {
      const tasksToInsert = defaultTasks.map(task => ({
        project_id: projectId,
        label: task.label,
        color: task.color,
        start_time: task.start,
        end_time: task.end,
        assignee: task.assignee,
        completion_status: task.completion_status,
        dependencies: task.dependencies,
        start_date: task.start_date,
        end_date: task.end_date,
        duration: task.duration
      }));

      const { data, error } = await supabase
        .from('project_tasks')
        .insert(tasksToInsert)
        .select();

      if (error) throw error;

      if (data) {
        const formattedTasks = data.map(task => ({
          id: task.id,
          label: task.label,
          color: task.color,
          start: task.start_time,
          end: task.end_time,
          assignee: task.assignee,
          completion_status: task.completion_status as 'pending' | 'in_progress' | 'completed',
          dependencies: task.dependencies || '',
          start_date: task.start_date || '',
          end_date: task.end_date || '',
          duration: task.duration || 1
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error creating default tasks:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron crear las tareas por defecto",
      });
    }
  };

  const handleAddTask = async () => {
    if (!projectId) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(addMonths(new Date(), 1), 'yyyy-MM-dd');

    try {
      const newTask = {
        project_id: projectId,
        label: "Nueva Tarea",
        color: "bg-[#F97316]",
        start_time: 1,
        end_time: 3,
        assignee: team[0],
        completion_status: 'pending' as const,
        dependencies: '',
        start_date: today,
        end_date: tomorrow,
        duration: 1
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
          completion_status: data.completion_status as 'pending' | 'in_progress' | 'completed',
          dependencies: data.dependencies || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          duration: data.duration || 1
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

  const handleTaskChange = async (taskId: number, field: keyof Task, value: any) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updateData = {
        [field === 'start' ? 'start_time' : 
         field === 'end' ? 'end_time' : 
         field]: value
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

  if (!projectId && !initialTasks) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Selecciona un proyecto para ver sus tareas
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <TimelineHeader
        currentDate={currentDate}
        onPreviousMonth={() => setCurrentDate(prev => subMonths(prev, 1))}
        onNextMonth={() => setCurrentDate(prev => addMonths(prev, 1))}
        onAddTask={handleAddTask}
        onTodayClick={() => setCurrentDate(new Date())}
      />
      <TimelineGrid
        tasks={tasks}
        editingTask={editingTask}
        daysInMonth={daysInMonth}
        onTaskChange={handleTaskChange}
        onRemoveTask={handleRemoveTask}
        setEditingTask={setEditingTask}
        team={team}
      />
    </div>
  );
}