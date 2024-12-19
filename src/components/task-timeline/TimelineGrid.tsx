import { Task } from "./types";
import { TaskBar } from "./TaskBar";

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

      <div className="grid grid-cols-7 auto-rows-fr gap-[1px] bg-muted relative">
        {Array.from({ length: daysInMonth }).map((_, i) => (
          <div 
            key={i} 
            className="min-h-[120px] bg-background p-1 relative group hover:bg-muted/50 transition-colors"
            onClick={() => setEditingTask(null)}
          >
            <div className="text-sm p-1">
              {i + 1}
            </div>
          </div>
        ))}
        
        {/* Render tasks as continuous bars */}
        {tasks.map((task) => (
          <TaskBar
            key={task.id}
            task={task}
            editingTask={editingTask}
            onTaskChange={onTaskChange}
            onRemoveTask={onRemoveTask}
            setEditingTask={setEditingTask}
            team={team}
            daysInMonth={daysInMonth}
            startDay={task.start}
            duration={task.end - task.start + 1}
          />
        ))}
      </div>
    </>
  );
}