import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File, Trash2, Upload, FileText } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface ProjectFile {
  name: string;
  url: string;
  created_at: string;
}

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

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');
};

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const input = document.createElement('input');
    input.type = 'file';
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(selectedFile);
    input.files = dataTransfer.files;
    const event = new Event('change', { bubbles: true }) as unknown as React.ChangeEvent<HTMLInputElement>;
    Object.defineProperty(event, 'target', { value: input });

    await onUpload(event);
    setSelectedFile(null);
  };

  const handleSummarize = async (file: ProjectFile) => {
    setIsSummarizing(file.name);
    try {
      // Download the file content
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      // Call the summarize-file function with base64 encoded file
      const { data, error } = await supabase.functions.invoke('summarize-file', {
        body: {
          fileName: file.name,
          fileContent: base64,
          fileType: blob.type
        }
      });

      if (error) throw error;

      if (data?.summary) {
        onAnalysisChange(data.summary);
        toast({
          title: "Resumen generado",
          description: "El resumen se ha generado correctamente"
        });
      }
    } catch (error) {
      console.error('Error summarizing file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el resumen del archivo"
      });
    } finally {
      setIsSummarizing(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Archivos del Proyecto</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            onChange={handleFileSelect}
            className="max-w-[300px]"
            disabled={isUploading}
            accept=".txt,.doc,.docx,.pdf"
          />
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
            <div className="flex items-center gap-2">
              <File className="h-4 w-4" />
              <span className="text-sm">{selectedFile.name}</span>
              <span className="text-sm text-muted-foreground">
                ({(selectedFile.size / 1024).toFixed(2)} KB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpload}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Subiendo...' : 'Subir'}
            </Button>
          </div>
        )}
      </div>
      
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSummarize(file)}
                disabled={isSummarizing === file.name}
              >
                <FileText className="h-4 w-4 mr-2" />
                {isSummarizing === file.name ? 'Resumiendo...' : 'Resumir'}
              </Button>
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
    </div>
  );
}