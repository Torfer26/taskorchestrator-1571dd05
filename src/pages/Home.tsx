import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { TaskProgress } from "@/components/TaskProgress";
import { TaskTimeline } from "@/components/TaskTimeline";
import { Sidebar } from "@/components/Sidebar";

const Home = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Start Your Day</h1>
              <p className="text-muted-foreground">& Be Productive 👋</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  className="pl-10 w-[300px]" 
                  placeholder="Start searching here..."
                />
              </div>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today Tasks</CardTitle>
                <button className="text-sm text-primary">See All</button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Task items would go here */}
                </div>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
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
            <Card>
              <CardHeader>
                <CardTitle>Task Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskProgress />
              </CardContent>
            </Card>

            {/* Task Timeline */}
            <Card>
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