import { Button } from "@/components/ui/button";
import { File, Trash2, FileText, BarChart2 } from "lucide-react";
import { ProjectFile } from "@/types/files";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import { useState } from "react";
import { GanttChart } from "./GanttChart";

interface FileListProps {
  files: ProjectFile[];
  isSummarizing: string | null;
  onSummarize: (file: ProjectFile) => Promise<void>;
  onDelete: (fileName: string) => Promise<void>;
}

interface Task {
  name: string;
  start: number;
  duration: number;
  progress: number;
  status: string;
}

export function FileList({ files, isSummarizing, onSummarize, onDelete }: FileListProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showGantt, setShowGantt] = useState(false);

  const isExcelFile = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'xlsx' || extension === 'xls';
  };

  const processExcelData = (data: any[]): Task[] => {
    // Encontrar la fila que contiene los encabezados
    const headerRow = data.find(row => 
      row["PLANTILLA DE SEGUIMIENTO DEL PROYECTO"] === "EN RIESGO" ||
      row["__EMPTY_4"] === "TAREA"
    );

    if (!headerRow) return [];

    // Filtrar las filas que contienen datos de tareas
    return data
      .filter(row => 
        row["__EMPTY_4"] && 
        row["__EMPTY_4"] !== "TAREA" && 
        row["__EMPTY_4"] !== "PROYECTOS" &&
        row["__EMPTY_4"] !== "NOMBRE DEL PROYECTO"
      )
      .map((row, index) => ({
        name: row["__EMPTY_4"] || `Tarea ${index + 1}`,
        start: index,
        duration: 1,
        progress: row["__EMPTY_8"] || 0,
        status: row["__EMPTY_1"] || "No iniciado"
      }));
  };

  const handleCreateProjectPlan = async (file: ProjectFile) => {
    try {
      console.log('Processing Excel file:', file.name);
      
      const response = await fetch(file.url);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Extracted data:', jsonData);
      
      const processedTasks = processExcelData(jsonData);
      setTasks(processedTasks);
      setShowGantt(true);
      
      toast({
        title: "Excel procesado correctamente",
        description: `Se han extraído ${processedTasks.length} tareas del archivo`
      });
      
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar el archivo Excel"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {files.map((file) => (
          <div 
            key={file.name}
            className="flex items-center justify-between p-3 bg-accent rounded-lg"
          >
            <div className="flex items-center gap-2">
              <File className="h-4 w-4" />
              <a 
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
              >
                {file.name}
              </a>
            </div>
            <div className="flex items-center gap-2">
              {isExcelFile(file.name) ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateProjectPlan(file)}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Create Project Plan
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSummarize(file)}
                  disabled={isSummarizing === file.name}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isSummarizing === file.name ? 'Resumiendo...' : 'Resumir'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(file.name)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showGantt && tasks.length > 0 && (
        <GanttChart tasks={tasks} />
      )}
    </div>
  );
}