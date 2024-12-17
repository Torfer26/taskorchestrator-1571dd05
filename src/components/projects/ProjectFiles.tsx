import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { processFile } from "@/services/fileProcessing";
import { FileUpload } from "./files/FileUpload";
import { FileList } from "./files/FileList";
import type { ProjectFile } from "@/types/files";

interface ProjectFilesProps {
  projectId: string;
  files: ProjectFile[];
  isUploading: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDelete: (fileName: string) => Promise<void>;
  onContextChange: (context: string) => void;
  context?: string;
  onAnalysisChange: (analysis: string) => void;
}

export function ProjectFiles({ 
  projectId, 
  files, 
  isUploading, 
  onUpload, 
  onDelete, 
  onContextChange, 
  context = '',
  onAnalysisChange 
}: ProjectFilesProps) {
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSummarize = async (file: ProjectFile) => {
    setIsSummarizing(file.name);
    try {
      const { summary } = await processFile(file.url);
      onAnalysisChange(summary);
      toast({
        title: "Resumen generado",
        description: "El resumen se ha generado correctamente"
      });
    } catch (error) {
      console.error('Error summarizing file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo generar el resumen del archivo"
      });
    } finally {
      setIsSummarizing(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Archivos del Proyecto</h3>
      
      <FileUpload 
        isUploading={isUploading}
        onUpload={onUpload}
      />
      
      <FileList 
        files={files}
        isSummarizing={isSummarizing}
        onSummarize={handleSummarize}
        onDelete={onDelete}
      />
    </div>
  );
}