import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { TaskProgress } from "@/components/TaskProgress";
import { TaskTimeline } from "@/components/TaskTimeline";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const tasks = [
    {
      title: "Delivery App Kit",
      description: "We got a project to make a delivery kit called Foodnow...",
      progress: 65,
      members: [1, 2, 3, 4],
    },
    {
      title: "Dribbble Shot",
      description: "Make a dribbble shot with a project management theme...",
      progress: 80,
      members: [2, 3, 4, 5],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Start Your Day</h1>
              <p className="text-muted-foreground">&amp; Be Productive ✌️</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  className="pl-10 w-[300px] bg-card border-sidebar-border" 
                  placeholder="Start searching here..."
                />
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://i.pravatar.cc/32" />
                  <AvatarFallback>KM</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Kim So Men</p>
                  <p className="text-xs text-muted-foreground">UI/UX Designer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today Tasks */}
            <Card className="bg-card border-sidebar-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today Tasks</CardTitle>
                <button className="text-sm text-primary">See All</button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <button>•••</button>
                      </div>
                      <div className="flex -space-x-2">
                        {task.members.map((member) => (
                          <Avatar key={member} className="border-2 border-card">
                            <AvatarImage src={`https://i.pravatar.cc/32?img=${member}`} />
                            <AvatarFallback>M{member}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-sidebar rounded-lg text-sm">
                  <p className="text-white">You have 5 tasks today. Keep it up! 💪</p>
                </div>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card className="bg-card border-sidebar-border">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                />
              </CardContent>
            </Card>

            {/* Task Progress */}
            <Card className="bg-card border-sidebar-border">
              <CardHeader>
                <CardTitle>Task Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskProgress />
              </CardContent>
            </Card>

            {/* Task Timeline */}
            <Card className="bg-card border-sidebar-border">
              <CardHeader>
                <CardTitle>Task Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskTimeline />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;