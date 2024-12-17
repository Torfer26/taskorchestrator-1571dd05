import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ProjectInfo } from "@/components/projects/ProjectInfo";
import { ProjectAnalysis } from "@/components/projects/ProjectAnalysis";
import { ProjectFiles } from "@/components/projects/ProjectFiles";
import { ProjectContext } from "@/components/projects/ProjectContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectFiles } from "@/hooks/useProjectFiles";

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
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [context, setContext] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const { files, isUploading, handleFileUpload, handleFileDelete } = useProjectFiles(id || '');

  useEffect(() => {
    if (id) fetchProject(parseInt(id));
  }, [id]);

  const fetchProject = async (projectId: number) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
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
        description: "No se pudo cargar el proyecto",
      });
    }
  };

  const handleContextChange = (newContext: string) => {
    setContext(newContext);
  };

  const handleAnalysisChange = (newAnalysis: string) => {
    setAnalysis(newAnalysis);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <ProjectHeader />
          <Button
            variant="outline"
            onClick={() => navigate('/home')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Ir a Home
          </Button>
        </div>

        <div className="space-y-8">
          {/* Project Info Card */}
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <ProjectInfo project={project} />
            
            {/* Context Section */}
            <div className="space-y-6">
              <ProjectContext projectId={project.id} />
            </div>
          </div>

          {/* Files Section */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-6">Archivos del Proyecto</h2>
            <ProjectFiles 
              projectId={project.id.toString()}
              files={files}
              isUploading={isUploading}
              onUpload={handleFileUpload}
              onDelete={handleFileDelete}
              onContextChange={handleContextChange}
              context={context}
              onAnalysisChange={handleAnalysisChange}
            />
          </div>

          {/* Analysis Section */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-6">Análisis del Proyecto</h2>
            <ProjectAnalysis projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  );
}