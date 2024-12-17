import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  Calendar as CalendarIcon,
  FolderKanban 
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/home" },
  { icon: MessageSquare, label: "Messages", path: "/messages", badge: 6 },
  { icon: CheckSquare, label: "My Tasks", path: "/tasks" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: Users, label: "Friends", path: "/friends" },
  { icon: CalendarIcon, label: "Calendar", path: "/timeline", badge: 2 },
];

export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-card border-r flex flex-col p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg" />
        <span className="font-bold text-lg">TaskMaster.</span>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
              item.path === "/home" && "bg-accent text-accent-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="border rounded-lg p-4">
          <div className="flex -space-x-2 mb-3">
            {[...Array(4)].map((_, i) => (
              <Avatar
                key={i}
                className="border-2 border-background"
              >
                <AvatarImage src={`https://i.pravatar.cc/32?img=${i + 1}`} />
                <AvatarFallback>U{i + 1}</AvatarFallback>
              </Avatar>
            ))}
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
              10+
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold">Team Online</h4>
            <p className="text-sm text-muted-foreground">
              You have a meeting in 30 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}