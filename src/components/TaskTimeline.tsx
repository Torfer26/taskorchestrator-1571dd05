import { cn } from "@/lib/utils";

const timelineItems = [
  { id: 1, label: "Interview", color: "bg-[#F97316]", start: 12, end: 13 },
  { id: 2, label: "Ideate", color: "bg-[#0EA5E9]", start: 13, end: 15 },
  { id: 3, label: "Wireframe", color: "bg-[#22C55E]", start: 15, end: 16 },
  { id: 4, label: "Evaluate", color: "bg-card", start: 16, end: 18 },
];

export function TaskTimeline() {
  return (
    <div className="relative pt-4">
      <div className="flex justify-between mb-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="text-sm text-muted-foreground">
            {12 + i * 1}
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        {timelineItems.map((item) => {
          const startPosition = ((item.start - 12) / 6) * 100;
          const width = ((item.end - item.start) / 6) * 100;
          
          return (
            <div
              key={item.id}
              className={cn(
                "h-8 rounded-full relative",
                item.color
              )}
              style={{
                marginLeft: `${startPosition}%`,
                width: `${width}%`,
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}