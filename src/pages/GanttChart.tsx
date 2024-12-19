import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TaskTimeline } from "@/components/TaskTimeline";

const initialTasks = `[
  {
    "task": "Inicio del Proyecto",
    "start_date": "2024-01-10",
    "duration": 2,
    "end_date": "2024-01-12",
    "dependencies": "",
    "profiles": "Gestor de Proyectos"
  },
  {
    "task": "Reunión de Kick-off",
    "start_date": "2024-01-12",
    "duration": 1,
    "end_date": "2024-01-12",
    "dependencies": "Inicio del Proyecto",
    "profiles": "Gestor de Proyectos, Equipo Técnico"
  },
  {
    "task": "Replanteo final en el CPD",
    "start_date": "2024-01-15",
    "duration": 3,
    "end_date": "2024-01-17",
    "dependencies": "Reunión de Kick-off",
    "profiles": "Técnico de Implementación"
  },
  {
    "task": "Diseño y plan de pruebas",
    "start_date": "2024-01-18",
    "duration": 5,
    "end_date": "2024-01-23",
    "dependencies": "Replanteo final en el CPD",
    "profiles": "Arquitecto de Soluciones"
  },
  {
    "task": "Instalación física del nuevo equipo ESS",
    "start_date": "2024-01-24",
    "duration": 5,
    "end_date": "2024-01-29",
    "dependencies": "Diseño y plan de pruebas",
    "profiles": "Técnico de Implementación"
  },
  {
    "task": "Instalación física de los Protocol Nodes",
    "start_date": "2024-01-30",
    "duration": 3,
    "end_date": "2024-02-02",
    "dependencies": "Instalación física del nuevo equipo ESS",
    "profiles": "Técnico de Implementación"
  },
  {
    "task": "Cableado de toda la infraestructura nueva",
    "start_date": "2024-02-03",
    "duration": 3,
    "end_date": "2024-02-06",
    "dependencies": "Instalación física de los Protocol Nodes",
    "profiles": "Técnico de Implementación"
  },
  {
    "task": "Configuración de los switches Mellanox",
    "start_date": "2024-02-07",
    "duration": 3,
    "end_date": "2024-02-10",
    "dependencies": "Cableado de toda la infraestructura nueva",
    "profiles": "Técnico de Redes"
  },
  {
    "task": "Implementación del cluster Scale",
    "start_date": "2024-02-11",
    "duration": 5,
    "end_date": "2024-02-16",
    "dependencies": "Configuración de los switches Mellanox",
    "profiles": "Administrador de Sistemas"
  },
  {
    "task": "Integración con autentificación",
    "start_date": "2024-02-17",
    "duration": 2,
    "end_date": "2024-02-19",
    "dependencies": "Implementación del cluster Scale",
    "profiles": "Administrador de Sistemas"
  },
  {
    "task": "Puesta en marcha de la monitorización",
    "start_date": "2024-02-20",
    "duration": 2,
    "end_date": "2024-02-22",
    "dependencies": "Integración con autentificación",
    "profiles": "Administrador de Sistema"
  },
  {
    "task": "Desarrollo de políticas de tiering",
    "start_date": "2024-02-23",
    "duration": 3,
    "end_date": "2024-02-26",
    "dependencies": "Puesta en marcha de la monitorización",
    "profiles": "Especialista en Sistemas"
  },
  {
    "task": "Soporte para la integración de backup y archivado",
    "start_date": "2024-02-27",
    "duration": 2,
    "end_date": "2024-03-01",
    "dependencies": "Desarrollo de políticas de tiering",
    "profiles": "Especialista en Backup"
  },
  {
    "task": "Pruebas de aceptación",
    "start_date": "2024-03-02",
    "duration": 3,
    "end_date": "2024-03-05",
    "dependencies": "Soporte para la integración de backup y archivado",
    "profiles": "Tester de QA"
  },
  {
    "task": "Documentación final del proyecto",
    "start_date": "2024-03-06",
    "duration": 2,
    "end_date": "2024-03-08",
    "dependencies": "Pruebas de aceptación",
    "profiles": "Documentador Técnico"
  },
  {
    "task": "Formación final al cliente",
    "start_date": "2024-03-09",
    "duration": 4,
    "end_date": "2024-03-13",
    "dependencies": "Documentación final del proyecto",
    "profiles": "Formador"
  },
  {
    "task": "Cierre del Proyecto",
    "start_date": "2024-03-14",
    "duration": 2,
    "end_date": "2024-03-16",
    "dependencies": "Formación final al cliente",
    "profiles": "Gestor de Proyectos"
  }
]`;

export default function GanttChart() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Convert id to number and ensure it's valid
  const projectId = id ? parseInt(id) : undefined;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/project/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Cronograma del Proyecto</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <TaskTimeline projectId={projectId} initialTasks={initialTasks} />
      </div>
    </div>
  );
}
