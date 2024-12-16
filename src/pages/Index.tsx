import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Users, FileText } from "lucide-react";

const features = [
  {
    icon: <Briefcase className="w-6 h-6" />,
    title: "Project Management",
    description: "Organize and track your projects with ease",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Team Collaboration",
    description: "Work together seamlessly with your team",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Document Handling",
    description: "Manage and share documents efficiently",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass fixed top-0 w-full z-50 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">ProjectFlow</h1>
          <div className="flex gap-4">
            <Button variant="ghost">Sign In</Button>
            <Button>Get Started</Button>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-24">
        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Streamline Your Project Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              An intelligent project management solution that helps teams collaborate,
              track progress, and deliver results efficiently.
            </p>
            <Button size="lg" className="animate-fade-in">
              Start Free Trial <ArrowRight className="ml-2" />
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full glass hover:shadow-lg transition-shadow">
                  <div className="mb-4 text-primary">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-muted-foreground">
            © 2024 ProjectFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;