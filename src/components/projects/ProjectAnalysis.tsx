import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ProjectAnalysisProps {
  analysis: string | null;
}

export function ProjectAnalysis({ analysis }: ProjectAnalysisProps) {
  if (!analysis) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">Análisis del Proyecto</h3>
        <Textarea
          value={analysis}
          readOnly
          className="min-h-[200px]"
        />
      </CardContent>
    </Card>
  );
}