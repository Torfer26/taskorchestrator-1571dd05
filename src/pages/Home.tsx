import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { TaskTimeline } from "@/components/TaskTimeline";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Project {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "on-hold";
  priority: "low" | "medium" | "high";
}

const Home = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
      
      if (data && data.length > 0) {
        setProjects(data);
        setSelectedProject(data[0]); // Seleccionar el primer proyecto por defecto
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Start Your Day</h1>
              <p className="text-muted-foreground">&amp; Be Productive ✌️</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  className="pl-10 w-[300px] bg-card border-sidebar-border" 
                  placeholder="Start searching here..."
                />
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://i.pravatar.cc/32" />
                  <AvatarFallback>KM</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Kim So Men</p>
                  <p className="text-xs text-muted-foreground">UI/UX Designer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-6">
            {/* Projects Section */}
            <Card className="bg-card border-sidebar-border h-fit">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Mis Proyectos</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/projects')}
                >
                  Ver Todos
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No hay proyectos todavía
                    </p>
                  ) : (
                    projects.slice(0, 3).map((project) => (
                      <Card 
                        key={project.id} 
                        className={cn(
                          "cursor-pointer hover:bg-accent/50 transition-colors",
                          selectedProject?.id === project.id && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedProject(project)}
                      >
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">{project.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex justify-between mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              project.status === 'active' ? 'bg-green-500/20 text-green-500' :
                              project.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {project.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              project.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                              project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-green-500/20 text-green-500'
                            }`}>
                              {project.priority}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Task Timeline */}
            <Card className="bg-card border-sidebar-border">
              <CardHeader>
                <CardTitle>
                  {selectedProject ? `Timeline: ${selectedProject.name}` : 'Task Timeline'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskTimeline projectId={selectedProject?.id} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;