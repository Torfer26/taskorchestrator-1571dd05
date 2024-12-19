import { Task, RawTask } from "./types";
import { calculateDayPosition } from "./dateUtils";

export function convertJsonToTasks(jsonData: RawTask[], currentDate: Date): Task[] {
  return jsonData.map((item, index) => ({
    id: index + 1,
    label: item.task,
    color: getColorForProfile(item.profiles),
    start: calculateDayPosition(item.start_date, currentDate),
    end: calculateDayPosition(item.end_date, currentDate),
    assignee: item.profiles.split(',')[0].trim(),
    completion_status: 'pending',
    dependencies: item.dependencies,
    start_date: item.start_date,
    end_date: item.end_date,
    duration: item.duration
  }));
}

export function getColorForProfile(profile: string): string {
  const colors = {
    'Gestor de Proyectos': 'bg-[#F97316]',
    'Equipo Técnico': 'bg-[#0EA5E9]',
    'Técnico de Implementación': 'bg-[#22C55E]',
    'Arquitecto de Soluciones': 'bg-[#6366F1]',
    'Administrador de Sistemas': 'bg-[#D946EF]',
    'Técnico de Redes': 'bg-[#EC4899]',
    'Especialista en Sistemas': 'bg-[#14B8A6]',
    'Especialista en Backup': 'bg-[#8B5CF6]',
    'Tester de QA': 'bg-[#F43F5E]',
    'Documentador Técnico': 'bg-[#06B6D4]',
    'Formador': 'bg-[#10B981]',
    'default': 'bg-[#94A3B8]'
  };

  const mainProfile = profile.split(',')[0].trim();
  return colors[mainProfile as keyof typeof colors] || colors.default;
}

export const defaultTasks: RawTask[] = [
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
    "task": "Desarrollo de la Aplicación",
    "start_date": "2024-01-13",
    "duration": 10,
    "end_date": "2024-01-23",
    "dependencies": "Reunión de Kick-off",
    "profiles": "Equipo Técnico"
  },
  {
    "task": "Pruebas de QA",
    "start_date": "2024-01-24",
    "duration": 5,
    "end_date": "2024-01-29",
    "dependencies": "Desarrollo de la Aplicación",
    "profiles": "Tester de QA"
  },
  {
    "task": "Implementación",
    "start_date": "2024-01-30",
    "duration": 3,
    "end_date": "2024-02-01",
    "dependencies": "Pruebas de QA",
    "profiles": "Técnico de Implementación"
  },
  {
    "task": "Cierre del Proyecto",
    "start_date": "2024-02-02",
    "duration": 1,
    "end_date": "2024-02-02",
    "dependencies": "Implementación",
    "profiles": "Gestor de Proyectos"
  }
];
