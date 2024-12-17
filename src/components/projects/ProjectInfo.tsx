import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProjectInfoProps {
  project: {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: "active" | "completed" | "on-hold";
    priority: "low" | "medium" | "high";
  };
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Descripción</h3>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Fecha de Inicio</h3>
            <p className="text-muted-foreground">
              {format(new Date(project.start_date), "PP")}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Fecha de Fin</h3>
            <p className="text-muted-foreground">
              {format(new Date(project.end_date), "PP")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Estado</h3>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium inline-block",
              {
                "bg-green-500/20 text-green-500": project.status === "active",
                "bg-blue-500/20 text-blue-500": project.status === "completed",
                "bg-yellow-500/20 text-yellow-500": project.status === "on-hold",
              }
            )}>
              {project.status}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Prioridad</h3>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium inline-block",
              {
                "bg-red-500/20 text-red-500": project.priority === "high",
                "bg-yellow-500/20 text-yellow-500": project.priority === "medium",
                "bg-green-500/20 text-green-500": project.priority === "low",
              }
            )}>
              {project.priority}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}