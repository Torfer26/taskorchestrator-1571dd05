import { cn } from "@/lib/utils";

export function TaskProgress() {
  const data = [
    { day: 12, progress: 8, label: "+8%" },
    { day: 13, progress: -12, label: "-12%" },
    { day: 14, progress: 5, label: "+5%" },
    { day: 15, progress: 65, label: "+65%" },
    { day: 16, progress: 8, label: "+8%" },
    { day: 17, progress: -10, label: "-10%" },
    { day: 18, progress: 6, label: "+6%" },
  ];

  return (
    <div className="flex items-end gap-4 h-[200px]">
      {data.map((item) => (
        <div
          key={item.day}
          className="flex-1 relative"
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm">
            {item.label}
          </div>
          <div
            className={cn(
              "w-full rounded-full transition-all duration-300",
              item.progress > 0 ? "bg-primary" : "bg-destructive",
            )}
            style={{
              height: `${Math.abs(item.progress)}%`,
            }}
          />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
            {item.day}
          </span>
        </div>
      ))}
    </div>
  );
}