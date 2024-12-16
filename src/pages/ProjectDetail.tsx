import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, File, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface Project {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "on-hold";
  priority: "low" | "medium" | "high";
}

interface ProjectFile {
  name: string;
  url: string;
  created_at: string;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [context, setContext] = useState("");
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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

    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from('project-files')
          .list(`project-${id}`);

        if (error) throw error;

        if (data) {
          const filesWithUrls = await Promise.all(
            data.map(async (file) => {
              const { data: { publicUrl } } = supabase
                .storage
                .from('project-files')
                .getPublicUrl(`project-${id}/${file.name}`);

              return {
                name: file.name,
                url: publicUrl,
                created_at: file.created_at
              };
            })
          );
          setFiles(filesWithUrls);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los archivos"
        });
      }
    };

    if (id) {
      fetchProject();
      fetchFiles();
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { error } = await supabase.storage
        .from('project-files')
        .upload(`project-${id}/${file.name}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase
        .storage
        .from('project-files')
        .getPublicUrl(`project-${id}/${file.name}`);

      setFiles(prev => [...prev, {
        name: file.name,
        url: publicUrl,
        created_at: new Date().toISOString()
      }]);

      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido correctamente"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir el archivo"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('project-files')
        .remove([`project-${id}/${fileName}`]);

      if (error) throw error;

      setFiles(prev => prev.filter(file => file.name !== fileName));
      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el archivo"
      });
    }
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

          <div className="space-y-4">
            <h3 className="font-medium">Archivos del Proyecto</h3>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                onChange={handleFileUpload}
                className="max-w-[300px]"
                disabled={isUploading}
              />
              {isUploading && <p className="text-sm text-muted-foreground">Subiendo archivo...</p>}
            </div>
            
            <div className="grid gap-4">
              {files.map((file) => (
                <div 
                  key={file.name}
                  className="flex items-center justify-between p-3 bg-accent rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <a 
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      {file.name}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFileDelete(file.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}