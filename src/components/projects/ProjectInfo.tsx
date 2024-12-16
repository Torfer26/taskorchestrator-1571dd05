import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Descripción</h3>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Fecha de Inicio</h3>
            <p className="text-muted-foreground">
              {format(new Date(project.start_date), "PP")}
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Fecha de Fin</h3>
            <p className="text-muted-foreground">
              {format(new Date(project.end_date), "PP")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Estado</h3>
            <span className={`px-2 py-1 rounded-full inline-block ${
              project.status === 'active' ? 'bg-green-500/20 text-green-500' :
              project.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
              'bg-yellow-500/20 text-yellow-500'
            }`}>
              {project.status}
            </span>
          </div>
          <div>
            <h3 className="font-medium mb-2">Prioridad</h3>
            <span className={`px-2 py-1 rounded-full inline-block ${
              project.priority === 'high' ? 'bg-red-500/20 text-red-500' :
              project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-green-500/20 text-green-500'
            }`}>
              {project.priority}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}