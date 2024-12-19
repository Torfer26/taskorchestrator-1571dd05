import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Task } from "./types";
import { TaskItem } from "./TaskItem";

interface TimelineGridProps {
  tasks: Task[];
  editingTask: number | null;
  daysInMonth: number;
  onTaskChange: (taskId: number, field: keyof Task, value: any) => void;
  onRemoveTask: (taskId: number) => void;
  setEditingTask: (taskId: number | null) => void;
  team: string[];
}

export function TimelineGrid({
  tasks,
  editingTask,
  daysInMonth,
  onTaskChange,
  onRemoveTask,
  setEditingTask,
  team,
}: TimelineGridProps) {
  return (
    <>
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
                    onTaskChange={onTaskChange}
                    onRemoveTask={onRemoveTask}
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
    </>
  );
}