import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import type { Task } from "./types";
import { convertJsonToTasks } from "./taskUtils";

export function useTaskTimelineState(projectId?: number, initialTasks?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const handleAddTask = async (taskData: any) => {
    if (!projectId) return;

    try {
      const newTask = {
        project_id: projectId,
        label: taskData.task,
        color: "bg-[#F97316]",
        start_time: 1,
        end_time: taskData.duration,
        assignee: taskData.profiles,
        completion_status: 'pending' as const,
        dependencies: taskData.dependencies,
        start_date: taskData.start_date,
        end_date: taskData.end_date,
        duration: taskData.duration
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
        toast({
          title: "Éxito",
          description: "Tarea creada correctamente",
        });
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

  return {
    tasks,
    editingTask,
    currentDate,
    setCurrentDate,
    setEditingTask,
    handleAddTask,
    handleTaskChange,
    handleRemoveTask
  };
}