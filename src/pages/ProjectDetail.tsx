import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ProjectInfo } from "@/components/projects/ProjectInfo";
import { ProjectFiles } from "@/components/projects/ProjectFiles";
import { ProjectContext } from "@/components/projects/ProjectContext";
import { ProjectAnalysis } from "@/components/projects/ProjectAnalysis";
import { useProjectAnalysis } from "@/hooks/useProjectAnalysis";
import { useProjectFiles } from "@/hooks/useProjectFiles";
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

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [context, setContext] = useState("");
  const { toast } = useToast();
  const { aiResponse, isAnalyzing, analyzeProjectWithAI } = useProjectAnalysis();
  const { files, isUploading, handleFileUpload, handleFileDelete } = useProjectFiles(id!);

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
        .maybeSingle();

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

    if (id) {
      fetchProject();
    }
  }, [id, toast]);

  const handleAnalyzeProject = async (model: string) => {
    if (!id) return;
    await analyzeProjectWithAI(id, context, files, model);
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
          onContextChange={setContext}
        />

        <ProjectAnalysis analysis={aiResponse || latestAnalysis} />
      </div>
    </div>
  );
}