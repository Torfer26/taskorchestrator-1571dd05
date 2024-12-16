import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";

interface ContextActionsProps {
  onSave: () => void;
  onAnalyze: () => void;
  selectedModel: string;
  onModelChange: (value: string) => void;
  isSaving: boolean;
  isAnalyzing: boolean;
}

export function ContextActions({
  onSave,
  onAnalyze,
  selectedModel,
  onModelChange,
  isSaving,
  isAnalyzing
}: ContextActionsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onSave} disabled={isSaving || isAnalyzing} variant="outline">
        {isSaving ? 'Guardando...' : 'Guardar Contexto'}
      </Button>
      <ModelSelector
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        disabled={isSaving || isAnalyzing}
      />
      <Button onClick={onAnalyze} disabled={isSaving || isAnalyzing}>
        {isAnalyzing ? 'Analizando...' : 'Analizar Proyecto con IA'}
      </Button>
    </div>
  );
}