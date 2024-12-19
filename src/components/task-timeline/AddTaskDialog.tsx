import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface AddTaskDialogProps {
  onAddTask: (taskData: any) => void;
  team: string[];
}

export function AddTaskDialog({ onAddTask, team }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    task: "",
    start_date: format(new Date(), 'yyyy-MM-dd'),
    duration: 1,
    end_date: format(new Date(), 'yyyy-MM-dd'),
    dependencies: "",
    profiles: team[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(taskData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#F97316] hover:bg-[#F97316]/90">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tarea
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task">Nombre de la Tarea</Label>
            <Input
              id="task"
              value={taskData.task}
              onChange={(e) => setTaskData({ ...taskData, task: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={taskData.start_date}
                onChange={(e) => setTaskData({ ...taskData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha de Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={taskData.end_date}
                onChange={(e) => setTaskData({ ...taskData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duración (días)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={taskData.duration}
              onChange={(e) => setTaskData({ ...taskData, duration: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependencies">Dependencias</Label>
            <Input
              id="dependencies"
              value={taskData.dependencies}
              onChange={(e) => setTaskData({ ...taskData, dependencies: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profiles">Asignado a</Label>
            <Select
              value={taskData.profiles}
              onValueChange={(value) => setTaskData({ ...taskData, profiles: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar perfil" />
              </SelectTrigger>
              <SelectContent>
                {team.map((member) => (
                  <SelectItem key={member} value={member}>
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">Crear Tarea</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}