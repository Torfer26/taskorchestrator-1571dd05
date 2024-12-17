import { Button } from "@/components/ui/button";
import { File, Trash2, FileText, BarChart2 } from "lucide-react";
import { ProjectFile } from "@/types/files";

interface FileListProps {
  files: ProjectFile[];
  isSummarizing: string | null;
  onSummarize: (file: ProjectFile) => Promise<void>;
  onDelete: (fileName: string) => Promise<void>;
}

export function FileList({ files, isSummarizing, onSummarize, onDelete }: FileListProps) {
  const isExcelFile = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'xlsx' || extension === 'xls';
  };

  return (
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
                onClick={() => console.log('Create project plan clicked')}
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
  );
}