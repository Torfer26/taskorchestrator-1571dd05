import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useProjectAnalysis } from "@/hooks/useProjectAnalysis";

interface ProjectAnalysisProps {
  projectId: number;
}

export function ProjectAnalysis({ projectId }: ProjectAnalysisProps) {
  const { aiResponse } = useProjectAnalysis();

  if (!aiResponse) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">Análisis del Proyecto</h3>
        <Textarea
          value={aiResponse}
          readOnly
          className="min-h-[200px] bg-accent"
        />
      </CardContent>
    </Card>
  );
}