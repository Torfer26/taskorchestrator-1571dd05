import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { processFile } from "@/services/fileProcessing";
import { FileUpload } from "./files/FileUpload";
import { FileList } from "./files/FileList";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [ocrNeeded, setOcrNeeded] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSummarize = async (file: ProjectFile) => {
    setIsSummarizing(file.name);
    setOcrNeeded(false);
    setProcessingError(null);
    
    try {
      console.log('Starting file processing for:', file.name);
      const { summary } = await processFile(file.url);
      onAnalysisChange(summary);
      toast({
        title: "Resumen generado",
        description: "El resumen se ha generado correctamente"
      });
    } catch (error) {
      console.error('Error summarizing file:', error);
      
      if (error.message === 'SCANNED_PDF') {
        setOcrNeeded(true);
        toast({
          title: "PDF Escaneado Detectado",
          description: "Este archivo necesita procesamiento OCR para extraer su contenido. Por favor, utiliza un servicio OCR externo."
        });
      } else {
        setProcessingError(error.message || 'No se pudo procesar el archivo. Por favor, inténtalo de nuevo.');
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "No se pudo generar el resumen del archivo"
        });
      }
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
      
      {ocrNeeded && (
        <Alert>
          <AlertDescription>
            Este archivo parece ser un PDF escaneado. Para procesar este tipo de archivos, 
            necesitarás utilizar un servicio OCR externo como Google Cloud Vision, AWS Textract 
            o un servidor personalizado con Tesseract OCR.
          </AlertDescription>
        </Alert>
      )}

      {processingError && (
        <Alert variant="destructive">
          <AlertDescription>
            {processingError}
          </AlertDescription>
        </Alert>
      )}
      
      <FileList 
        files={files}
        isSummarizing={isSummarizing}
        onSummarize={handleSummarize}
        onDelete={onDelete}
      />
    </div>
  );
}