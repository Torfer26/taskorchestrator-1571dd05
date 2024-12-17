interface TimelineHeaderProps {
  startHour: number;
  duration: number;
}

export function TimelineHeader({ startHour, duration }: TimelineHeaderProps) {
  return (
    <div className="flex justify-between mb-8">
      {Array.from({ length: duration + 1 }).map((_, i) => (
        <div key={i} className="text-sm text-muted-foreground">
          {startHour + i}:00
        </div>
      ))}
    </div>
  );
}