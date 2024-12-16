import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProjectHeader() {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      className="mb-6"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Volver
    </Button>
  );
}