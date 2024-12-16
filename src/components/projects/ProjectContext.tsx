import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface ProjectContextProps {
  projectId: string;
  context: string;
  onContextChange: (value: string) => void;
  onAnalyze: () => Promise<void>;
}

export function ProjectContext({ projectId, context, onContextChange, onAnalyze }: ProjectContextProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Contexto del Proyecto para IA</h3>
      <Textarea
        placeholder="Añade información de contexto sobre el proyecto que ayudará a la IA a generar mejores respuestas..."
        className="min-h-[200px]"
        value={context}
        onChange={(e) => onContextChange(e.target.value)}
      />
      <Button onClick={onAnalyze}>
        Analizar Proyecto con IA
      </Button>
    </div>
  );
}