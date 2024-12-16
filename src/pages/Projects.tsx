import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "on-hold";
  priority: "low" | "medium" | "high";
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProject: Project = {
      id: Date.now(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      startDate: startDate!,
      endDate: endDate!,
      status: formData.get("status") as "active" | "completed" | "on-hold",
      priority: formData.get("priority") as "low" | "medium" | "high",
    };

    setProjects([...projects, newProject]);
    setIsDialogOpen(false);
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" name="name" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      className="absolute top-10 z-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      className="absolute top-10 z-50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    name="priority"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <Button type="submit" className="w-full">Create Project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex justify-between text-sm">
                  <span>Start: {format(project.startDate, "PP")}</span>
                  <span>End: {format(project.endDate, "PP")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={cn(
                    "px-2 py-1 rounded-full",
                    {
                      "bg-green-500/20 text-green-500": project.status === "active",
                      "bg-blue-500/20 text-blue-500": project.status === "completed",
                      "bg-yellow-500/20 text-yellow-500": project.status === "on-hold",
                    }
                  )}>
                    {project.status}
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded-full",
                    {
                      "bg-red-500/20 text-red-500": project.priority === "high",
                      "bg-yellow-500/20 text-yellow-500": project.priority === "medium",
                      "bg-green-500/20 text-green-500": project.priority === "low",
                    }
                  )}>
                    {project.priority} priority
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}