import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface CreateProjectFormProps {
  onSubmit: (project: any) => void;
  onClose: () => void;
}

export function CreateProjectForm({ onSubmit, onClose }: CreateProjectFormProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { toast } = useToast();

  const onFormSubmit = (data: any) => {
    console.log("Form submitted with data:", data);
    
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor introduce las fechas de inicio y fin",
      });
      return;
    }

    const newProject = {
      name: data.name,
      description: data.description,
      start_date: startDate,
      end_date: endDate,
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
          <Label htmlFor="startDate">Fecha de Inicio</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha de Fin</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full"
          />
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