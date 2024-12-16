import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ProjectInfo } from "@/components/projects/ProjectInfo";
import { ProjectFiles } from "@/components/projects/ProjectFiles";
import { ProjectContext } from "@/components/projects/ProjectContext";
import { ProjectAnalysis } from "@/components/projects/ProjectAnalysis";
import { useProjectAnalysis } from "@/hooks/useProjectAnalysis";
import { useQuery } from "@tanstack/react-query";

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
  const [project, setProject] = useState<Project | null>(null);
  const [context, setContext] = useState("");
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { aiResponse, isAnalyzing, analyzeProjectWithAI } = useProjectAnalysis();

  // Fetch the latest analysis
  const { data: latestAnalysis } = useQuery({
    queryKey: ['projectAnalysis', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_analyses')
        .select('analysis')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data?.analysis || null;
    }
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (data) setProject(data);
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

  const handleAnalyzeProject = async (model: string) => {
    await analyzeProjectWithAI(context, files, model);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <ProjectHeader />
      <ProjectInfo project={project} />
      
      <div className="grid gap-6">
        <ProjectContext 
          projectId={id!}
          context={context}
          onContextChange={setContext}
          onAnalyze={handleAnalyzeProject}
        />
        
        <ProjectFiles 
          projectId={id!}
          files={files}
          isUploading={isUploading}
          onUpload={handleFileUpload}
          onDelete={handleFileDelete}
        />

        <ProjectAnalysis analysis={aiResponse || latestAnalysis} />
      </div>
    </div>
  );
}
