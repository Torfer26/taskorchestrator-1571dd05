import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TaskTimeline } from "@/components/TaskTimeline";

export default function GanttChart() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Convert id to number and ensure it's valid
  const projectId = id ? parseInt(id) : undefined;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/project/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Cronograma del Proyecto</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <TaskTimeline projectId={projectId} />
      </div>
    </div>
  );
}