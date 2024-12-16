import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { analyzeProject } from "@/services/openai";

interface ProjectFile {
  name: string;
  url: string;
  created_at: string;
}

export function useProjectAnalysis() {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeProjectWithAI = async (context: string, files: ProjectFile[], model: string) => {
    setIsAnalyzing(true);
    try {
      const response = await analyzeProject(context, files, model);
      setAiResponse(response);
      toast({
        title: "Análisis completado",
        description: "El proyecto ha sido analizado correctamente"
      });
    } catch (error) {
      console.error('Error analyzing project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo analizar el proyecto"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    aiResponse,
    isAnalyzing,
    analyzeProjectWithAI
  };
}