import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function PdfConsultation() {
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, sube un archivo PDF válido."
      });
      event.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!file || !query.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, sube un archivo PDF y escribe una consulta."
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('query', query);

      const response = await fetch('/api/consult-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al procesar el archivo');
      }

      const data = await response.json();
      setResponse(data.response);
      
      toast({
        title: "Éxito",
        description: "Consulta procesada correctamente"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al procesar el archivo. Inténtalo de nuevo más tarde."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setQuery("");
    setResponse("");
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-sm text-muted-foreground">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>

          <div>
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe tu consulta aquí"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isLoading || !file || !query.trim()}
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Subir y Consultar Archivo
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              disabled={isLoading}
            >
              Limpiar
            </Button>
          </div>

          {response && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Respuesta:</h3>
              <Textarea
                value={response}
                readOnly
                className="min-h-[200px]"
              />
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}