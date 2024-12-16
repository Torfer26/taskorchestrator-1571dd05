import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface ProjectContextProps {
  projectId: string;
  context: string;
  onContextChange: (value: string) => void;
  onAnalyze: () => Promise<void>;
}

export function ProjectContext({ projectId, context, onContextChange, onAnalyze }: ProjectContextProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadContext = async () => {
      try {
        const { data, error } = await supabase
          .from('project_contexts')
          .select('context')
          .eq('project_id', projectId)
          .single();

        if (error) throw error;
        if (data) {
          onContextChange(data.context || '');
        }
      } catch (error) {
        console.error('Error loading context:', error);
      }
    };

    if (projectId) {
      loadContext();
    }
  }, [projectId]);

  const saveContext = async (newContext: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('project_contexts')
        .upsert({
          project_id: projectId,
          context: newContext
        });

      if (error) throw error;

      toast({
        title: "Contexto guardado",
        description: "El contexto del proyecto se ha guardado correctamente"
      });
    } catch (error) {
      console.error('Error saving context:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el contexto del proyecto"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleContextChange = (value: string) => {
    onContextChange(value);
    saveContext(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Contexto del Proyecto para IA</h3>
      <Textarea
        placeholder="Añade información de contexto sobre el proyecto que ayudará a la IA a generar mejores respuestas..."
        className="min-h-[200px]"
        value={context}
        onChange={(e) => handleContextChange(e.target.value)}
      />
      <Button onClick={onAnalyze} disabled={isSaving}>
        Analizar Proyecto con IA
      </Button>
    </div>
  );
}