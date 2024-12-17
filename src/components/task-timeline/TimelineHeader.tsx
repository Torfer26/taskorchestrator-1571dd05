import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TimelineHeaderProps {
  currentDate: Date;
  daysInMonth: number;
}

export function TimelineHeader({ currentDate, daysInMonth }: TimelineHeaderProps) {
  return (
    <div className="grid grid-cols-[repeat(31,1fr)] mb-8">
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
        return (
          <div key={i} className="text-sm text-muted-foreground text-center">
            <div>{format(date, 'EEE', { locale: es })}</div>
            <div>{i + 1}</div>
          </div>
        );
      })}
    </div>
  );
}