import { Card, CardContent } from "@/components/ui/card";

interface ProjectAnalysisProps {
  analysis: string | null;
}

export function ProjectAnalysis({ analysis }: ProjectAnalysisProps) {
  if (!analysis) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">Análisis del Proyecto</h3>
        <div className="whitespace-pre-wrap text-muted-foreground">
          {analysis}
        </div>
      </CardContent>
    </Card>
  );
}