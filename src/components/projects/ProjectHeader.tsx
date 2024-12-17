import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProjectHeader() {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-lg"
    >
      <ArrowLeft className="h-5 w-5" />
      Volver
    </Button>
  );
}