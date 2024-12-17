import { Card, CardContent } from "@/components/ui/card";

interface ProjectAnalysisProps {
  analysis: string | null;
}

export function ProjectAnalysis({ analysis }: ProjectAnalysisProps) {
  if (!analysis) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">Resumen archivo</h3>
        <div className="whitespace-pre-wrap text-muted-foreground bg-accent/50 p-4 rounded-lg">
          {analysis}
        </div>
      </CardContent>
    </Card>
  );
}