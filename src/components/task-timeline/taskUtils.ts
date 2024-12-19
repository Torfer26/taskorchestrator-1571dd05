import { Task } from "./types";
import { calculateDayPosition, calculateTaskDuration } from "./dateUtils";

interface RawTask {
  task: string;
  start_date: string;
  duration: number;
  end_date: string;
  dependencies: string;
  profiles: string;
}

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