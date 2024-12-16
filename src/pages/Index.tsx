import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "¡Bienvenido de nuevo!",
          description: "Has iniciado sesión correctamente.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "¡Registro exitoso!",
          description: "Por favor, verifica tu correo electrónico para continuar.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] relative overflow-hidden">
      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom right, rgba(66, 71, 91, 0.1), rgba(26, 31, 44, 0.1))",
          backgroundSize: "100% 100%",
        }}
      />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-[#7FE7D9] text-2xl font-bold">TaskOrchestrator</h1>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white"
              onClick={() => setIsLogin(true)}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white"
              onClick={() => setIsLogin(false)}
            >
              Registrarse
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            TU MEJOR
            <br />
            <span className="text-[#7FE7D9]">GESTOR DE PROYECTOS</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Desde la organización de tareas hasta la colaboración en equipo, nuestra plataforma
            te ayuda a entregar proyectos adaptados a tus necesidades únicas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="w-full max-w-md p-6 bg-[#242937] border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-6">
                {isLogin ? "Bienvenido de nuevo" : "Crear cuenta"}
              </h3>
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1A1F2C] border-gray-700 text-white placeholder:text-gray-500"
                />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1A1F2C] border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#7FE7D9] text-[#1A1F2C] hover:bg-[#6CD0C4]"
                disabled={loading}
              >
                {loading ? "Procesando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center text-sm text-gray-400 mt-4">
                {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#7FE7D9] hover:underline"
                >
                  {isLogin ? "Crear una" : "Iniciar sesión"}
                </button>
              </p>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;