import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TimelineHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onTodayClick: () => void;
}

export function TimelineHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onTodayClick,
}: TimelineHeaderProps) {
  return (
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
  );
}