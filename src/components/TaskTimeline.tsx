import { getDaysInMonth } from "date-fns";
import type { Task } from "./task-timeline/types";
import { TimelineHeader } from "./task-timeline/TimelineHeader";
import { TimelineGrid } from "./task-timeline/TimelineGrid";
import { AddTaskDialog } from "./task-timeline/AddTaskDialog";
import { useTaskTimelineState } from "./task-timeline/TaskTimelineState";

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
  const {
    tasks,
    editingTask,
    currentDate,
    setCurrentDate,
    setEditingTask,
    handleAddTask,
    handleTaskChange,
    handleRemoveTask
  } = useTaskTimelineState(projectId, initialTasks);

  const daysInMonth = getDaysInMonth(currentDate);

  if (!projectId && !initialTasks) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Selecciona un proyecto para ver sus tareas
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-4">
        <TimelineHeader
          currentDate={currentDate}
          onPreviousMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
          onNextMonth={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
          onTodayClick={() => setCurrentDate(new Date())}
        />
        <AddTaskDialog onAddTask={handleAddTask} team={team} />
      </div>
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