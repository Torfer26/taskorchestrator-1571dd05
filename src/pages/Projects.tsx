import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderPlus } from "lucide-react";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "on-hold";
  priority: "low" | "medium" | "high";
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load projects",
      });
    }
  };

  const handleCreateProject = async (newProject: Omit<Project, "id">) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProjects([...projects, data]);
        setIsDialogOpen(false);
        toast({
          title: "Success",
          description: "Project created successfully",
        });
        navigate("/"); // Redirect to dashboard
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create project",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <CreateProjectForm 
              onSubmit={handleCreateProject}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}