import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File, Trash2 } from "lucide-react";
import { useState } from "react";

interface ProjectFile {
  name: string;
  url: string;
  created_at: string;
}

interface ProjectFilesProps {
  files: ProjectFile[];
  isUploading: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDelete: (fileName: string) => Promise<void>;
}

export function ProjectFiles({ files, isUploading, onUpload, onDelete }: ProjectFilesProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Archivos del Proyecto</h3>
      <div className="flex items-center gap-4">
        <Input
          type="file"
          onChange={onUpload}
          className="max-w-[300px]"
          disabled={isUploading}
        />
        {isUploading && <p className="text-sm text-muted-foreground">Subiendo archivo...</p>}
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