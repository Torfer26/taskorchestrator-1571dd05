import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

interface Task {
  name: string;
  start: number;
  duration: number;
  progress: number;
  status: string;
}

interface GanttChartProps {
  tasks: Task[];
}

export function GanttChart({ tasks }: GanttChartProps) {
  return (
    <Card className="w-full mt-4">
      <CardContent className="pt-6">
        <h4 className="font-medium mb-4">Plan del Proyecto</h4>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={tasks}
              layout="vertical"
              barSize={20}
              margin={{
                top: 20,
                right: 30,
                left: 100,
                bottom: 5,
              }}
            >
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={150}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'progress') return `${(Number(value) * 100).toFixed(0)}%`;
                  return value;
                }}
              />
              <Bar 
                dataKey="duration" 
                fill="#93c5fd"
                radius={[4, 4, 4, 4]}
              />
              <Bar 
                dataKey="progress" 
                fill="#3b82f6"
                radius={[4, 4, 4, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}