import { Textarea } from "@/components/ui/textarea";

interface ContextEditorProps {
  context: string;
  onContextChange: (value: string) => void;
}

export function ContextEditor({ context, onContextChange }: ContextEditorProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">Contexto del Proyecto para IA</h3>
      <Textarea
        placeholder="Añade información de contexto sobre el proyecto que ayudará a la IA a generar mejores respuestas..."
        className="min-h-[200px]"
        value={context}
        onChange={(e) => onContextChange(e.target.value)}
      />
    </div>
  );
}