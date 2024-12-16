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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContext = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('project_contexts')
          .select('context')
          .eq('project_id', projectId)
          .single();

        if (error) {
          if (error.code === '42P01') {
            // Table doesn't exist yet, this is expected on first run
            console.log('Project contexts table not found - this is normal on first run');
            return;
          }
          throw error;
        }
        
        if (data) {
          onContextChange(data.context || '');
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

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">
      <p className="text-muted-foreground">Cargando contexto...</p>
    </div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Contexto del Proyecto para IA</h3>
      <Textarea
        placeholder="Añade información de contexto sobre el proyecto que ayudará a la IA a generar mejores respuestas..."
        className="min-h-[200px]"
        value={context}
        onChange={(e) => onContextChange(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={saveContext} disabled={isSaving} variant="outline">
          {isSaving ? 'Guardando...' : 'Guardar Contexto'}
        </Button>
        <Button onClick={onAnalyze} disabled={isSaving}>
          Analizar Proyecto con IA
        </Button>
      </div>
    </div>
  );
}