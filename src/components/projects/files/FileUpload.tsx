import { Input } from "@/components/ui/input";
import { File } from "lucide-react";
import { useState } from "react";

interface FileUploadProps {
  isUploading: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function FileUpload({ isUploading, onUpload }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(fileType)) {
        alert('Por favor, selecciona un archivo PDF o DOCX');
        return;
      }
      
      setSelectedFile(file);
      await handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    const input = document.createElement('input');
    input.type = 'file';
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
    const event = new Event('change', { bubbles: true }) as unknown as React.ChangeEvent<HTMLInputElement>;
    Object.defineProperty(event, 'target', { value: input });

    await onUpload(event);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          onChange={handleFileSelect}
          className="max-w-[300px]"
          disabled={isUploading}
          accept=".pdf,.docx"
        />
      </div>

      {selectedFile && isUploading && (
        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4" />
            <span className="text-sm">{selectedFile.name}</span>
            <span className="text-sm text-muted-foreground">
              ({(selectedFile.size / 1024).toFixed(2)} KB)
            </span>
          </div>
          <span className="text-sm text-muted-foreground">Subiendo...</span>
        </div>
      )}
    </div>
  );
}