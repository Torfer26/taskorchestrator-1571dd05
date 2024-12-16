import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Project {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "on-hold";
  priority: "low" | "medium" | "high";
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [context, setContext] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setProject(data);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el proyecto"
        });
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id, toast]);

  const handleContextSave = async () => {
    // Esta función se implementará más adelante cuando se añada
    // la funcionalidad de IA
    toast({
      title: "Información guardada",
      description: "El contexto del proyecto ha sido actualizado"
    });
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Descripción</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Fecha de Inicio</h3>
              <p className="text-muted-foreground">
                {format(new Date(project.start_date), "PP")}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Fecha de Fin</h3>
              <p className="text-muted-foreground">
                {format(new Date(project.end_date), "PP")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Estado</h3>
              <span className={`px-2 py-1 rounded-full inline-block ${
                project.status === 'active' ? 'bg-green-500/20 text-green-500' :
                project.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                'bg-yellow-500/20 text-yellow-500'
              }`}>
                {project.status}
              </span>
            </div>
            <div>
              <h3 className="font-medium mb-2">Prioridad</h3>
              <span className={`px-2 py-1 rounded-full inline-block ${
                project.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-green-500/20 text-green-500'
              }`}>
                {project.priority}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Contexto del Proyecto para IA</h3>
            <Textarea
              placeholder="Añade información de contexto sobre el proyecto que ayudará a la IA a generar mejores respuestas..."
              className="min-h-[200px]"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
            <Button onClick={handleContextSave}>
              Guardar Contexto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}