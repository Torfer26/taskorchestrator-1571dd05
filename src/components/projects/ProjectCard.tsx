import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    description: string;
    startDate: string; // Changed to string since we store ISO strings
    endDate: string; // Changed to string since we store ISO strings
    status: "active" | "completed" | "on-hold";
    priority: "low" | "medium" | "high";
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{project.description}</p>
          <div className="flex justify-between text-sm">
            <span>Start: {format(new Date(project.startDate), "PP")}</span>
            <span>End: {format(new Date(project.endDate), "PP")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={cn(
              "px-2 py-1 rounded-full",
              {
                "bg-green-500/20 text-green-500": project.status === "active",
                "bg-blue-500/20 text-blue-500": project.status === "completed",
                "bg-yellow-500/20 text-yellow-500": project.status === "on-hold",
              }
            )}>
              {project.status}
            </span>
            <span className={cn(
              "px-2 py-1 rounded-full",
              {
                "bg-red-500/20 text-red-500": project.priority === "high",
                "bg-yellow-500/20 text-yellow-500": project.priority === "medium",
                "bg-green-500/20 text-green-500": project.priority === "low",
              }
            )}>
              {project.priority} priority
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}