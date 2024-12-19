import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

interface TimelineHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onAddTask: () => void;
  onTodayClick: () => void;
}

export function TimelineHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onAddTask,
  onTodayClick,
}: TimelineHeaderProps) {
  return (
    <div className="flex justify-between items-center h-16 px-4 border-b">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-lg font-medium"
          onClick={onTodayClick}
        >
          Hoy
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium min-w-32 text-center">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </span>
          <Button variant="ghost" size="icon" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button onClick={onAddTask} size="sm" className="bg-[#F97316] hover:bg-[#F97316]/90">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Tarea
      </Button>
    </div>
  );
}