import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <h3 className="font-medium">Contexto del Proyecto para IA</h3>
      <Textarea
        placeholder="Añade información de contexto sobre el proyecto que ayudará a la IA a generar mejores respuestas..."
        className="min-h-[200px]"
        value={context}
        onChange={(e) => onContextChange(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={saveContext} disabled={isSaving || isAnalyzing} variant="outline">
          {isSaving ? 'Guardando...' : 'Guardar Contexto'}
        </Button>
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecciona modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o-mini">GPT-4 Mini (Rápido)</SelectItem>
            <SelectItem value="gpt-4o">GPT-4 (Mejor calidad)</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAnalyze} disabled={isSaving || isAnalyzing}>
          {isAnalyzing ? 'Analizando...' : 'Analizar Proyecto con IA'}
        </Button>
      </div>
    </div>
  );
}