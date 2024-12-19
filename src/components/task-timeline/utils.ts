import { parseISO, differenceInDays } from 'date-fns';
import { Task } from './types';

export function convertJsonToTasks(jsonData: any[]): Task[] {
  return jsonData.map((item, index) => ({
    id: index + 1,
    label: item.task,
    color: getColorForProfile(item.profiles),
    start: 1, // We'll calculate this based on the month view
    end: 3,   // We'll calculate this based on the month view
    assignee: item.profiles.split(',')[0].trim(),
    completion_status: 'pending'
  }));
}

export function getColorForProfile(profile: string): string {
  const colors = {
    'Gestor de Proyectos': 'bg-[#F97316]',
    'Equipo Técnico': 'bg-[#0EA5E9]',
    'Técnico de Implementación': 'bg-[#22C55E]',
    'Arquitecto de Soluciones': 'bg-[#6366F1]',
    'Administrador de Sistemas': 'bg-[#D946EF]',
    'default': 'bg-[#94A3B8]'
  };

  const mainProfile = profile.split(',')[0].trim();
  return colors[mainProfile as keyof typeof colors] || colors.default;
}