import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { ContextEditor } from "./context/ContextEditor";
import { ContextActions } from "./context/ContextActions";

interface ProjectContextProps {
  projectId: string;
  context: string;
  onContextChange: (value: string) => void;
  onAnalyze: (model: string) => Promise<void>;
}

export function ProjectContext({ projectId, context, onContextChange, onAnalyze }: ProjectContextProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");

  useEffect(() => {
    const loadContext = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('project_contexts')
          .select('context')
          .eq('project_id', projectId)
          .maybeSingle();

        if (error) {
          if (error.code === '42P01') {
            console.log('Project contexts table not found - this is normal on first run');
            setIsLoading(false);
            return;
          }
          throw error;
        }
        
        if (data) {
          onContextChange(data.context || '');
        } else {
          onContextChange('');
        }
      } catch (error) {
        console.error('Error loading context:', error);
        toast({
          variant: "destructive",
          title: "Error al cargar",
          description: "No se pudo cargar el contexto del proyecto. Por favor, intente nuevamente."
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadContext();
    }
  }, [projectId, toast, onContextChange]);

  const saveContext = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('project_contexts')
        .upsert({
          project_id: projectId,
          context: context
        }, {
          onConflict: 'project_id'
        });

      if (error) {
        if (error.code === '42P01') {
          toast({
            variant: "destructive",
            title: "Error",
            description: "La tabla de contextos no existe aún. Por favor, ejecute las migraciones primero."
          });
          return;
        }
        throw error;
      }

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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await onAnalyze(selectedModel);
    } catch (error) {
      console.error('Error analyzing project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al analizar el proyecto"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">
      <p className="text-muted-foreground">Cargando contexto...</p>
    </div>;
  }

  return (
    <div className="space-y-4">
      <ContextEditor 
        context={context}
        onContextChange={onContextChange}
      />
      <ContextActions
        onSave={saveContext}
        onAnalyze={handleAnalyze}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        isSaving={isSaving}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
}