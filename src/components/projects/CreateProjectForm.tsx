import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface CreateProjectFormProps {
  onSubmit: (project: any) => void;
  onClose: () => void;
}

export function CreateProjectForm({ onSubmit, onClose }: CreateProjectFormProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { toast } = useToast();

  const onFormSubmit = (data: any) => {
    console.log("Form submitted with data:", data);
    
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona las fechas de inicio y fin",
      });
      return;
    }

    const newProject = {
      name: data.name,
      description: data.description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: data.status || 'active',
      priority: data.priority || 'medium',
    };

    console.log("Sending project data:", newProject);
    onSubmit(newProject);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Proyecto</Label>
        <Input 
          id="name" 
          {...register("name", { required: true })} 
        />
        {errors.name && <span className="text-red-500">Este campo es requerido</span>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea 
          id="description" 
          {...register("description", { required: true })} 
        />
        {errors.description && <span className="text-red-500">Este campo es requerido</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha de Inicio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Selecciona una fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Fecha de Fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Selecciona una fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            {...register("status")}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            defaultValue="active"
          >
            <option value="active">Activo</option>
            <option value="completed">Completado</option>
            <option value="on-hold">En Espera</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <select
            id="priority"
            {...register("priority")}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            defaultValue="medium"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">Crear Proyecto</Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
      </div>
    </form>
  );
}