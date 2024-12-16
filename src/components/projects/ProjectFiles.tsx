import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File, Trash2, Upload } from "lucide-react";
import { useState } from "react";

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
}

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid characters with underscore
    .replace(/_{2,}/g, '_'); // Replace multiple consecutive underscores with single one
};

export function ProjectFiles({ projectId, files, isUploading, onUpload, onDelete }: ProjectFilesProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const event = {
      target: {
        files: [selectedFile]
      }
    } as React.ChangeEvent<HTMLInputElement>;

    await onUpload(event);
    setSelectedFile(null);
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(file.name)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}