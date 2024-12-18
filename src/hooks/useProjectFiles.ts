import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface ProjectFile {
  name: string;
  url: string;
  created_at: string;
}

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid characters with underscore
    .replace(/_{2,}/g, '_'); // Replace multiple consecutive underscores with single one
};

export function useProjectFiles(projectId: string) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .storage
        .from('project-files')
        .list(`project-${projectId}`);

      if (error) throw error;

      if (data) {
        const filesWithUrls = await Promise.all(
          data.map(async (file) => {
            const { data: { publicUrl } } = supabase
              .storage
              .from('project-files')
              .getPublicUrl(`project-${projectId}/${file.name}`);

            return {
              name: file.name,
              url: publicUrl,
              created_at: file.created_at
            };
          })
        );
        setFiles(filesWithUrls);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los archivos"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Sanitize the file name before upload
      const sanitizedFileName = sanitizeFileName(file.name);
      const filePath = `project-${projectId}/${sanitizedFileName}`;

      // Create a new File object with the sanitized name
      const sanitizedFile = new File([file], sanitizedFileName, {
        type: file.type,
      });

      const { error } = await supabase.storage
        .from('project-files')
        .upload(filePath, sanitizedFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase
        .storage
        .from('project-files')
        .getPublicUrl(filePath);

      setFiles(prev => [...prev, {
        name: sanitizedFileName,
        url: publicUrl,
        created_at: new Date().toISOString()
      }]);

      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido correctamente"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir el archivo"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('project-files')
        .remove([`project-${projectId}/${fileName}`]);

      if (error) throw error;

      setFiles(prev => prev.filter(file => file.name !== fileName));
      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el archivo"
      });
    }
  };

  return {
    files,
    isUploading,
    handleFileUpload,
    handleFileDelete
  };
}