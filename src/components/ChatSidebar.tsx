import { History, Plus, User, Settings, Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

interface ChatHistory {
  id: string;
  title: string;
  date: string;
}

const mockHistory: ChatHistory[] = [
  { id: "1", title: "Brake pad search", date: "Today" },
  { id: "2", title: "Engine oil filter", date: "Today" },
  { id: "3", title: "Timing belt kit", date: "Yesterday" },
  { id: "4", title: "Suspension parts", date: "2 days ago" },
];

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const ChatSidebar = ({ isCollapsed, onToggle }: ChatSidebarProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className={`flex items-center p-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <h2 className="text-lg font-semibold text-foreground">Partify</h2>}
        <div className={`flex gap-1 ${isCollapsed ? 'flex-col' : ''}`}>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <Menu className="h-4 w-4" />
          </Button>
          {!isCollapsed && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Chat History */}
      <ScrollArea className="flex-1 px-3">
        {!isCollapsed ? (
          <div className="space-y-1 py-4">
            <div className="mb-2 flex items-center gap-2 px-3 text-sm font-medium text-muted-foreground">
              <History className="h-4 w-4" />
              <span>Recent Searches</span>
            </div>
            {mockHistory.map((chat) => (
              <button
                key={chat.id}
                className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              >
                <div className="font-medium text-foreground">{chat.title}</div>
                <div className="text-xs text-muted-foreground">{chat.date}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <History className="h-4 w-4" />
            </Button>
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* Account Section */}
      <div className="p-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-sm">
              <div className="font-medium text-foreground">Repair Shop</div>
              <div className="text-xs text-muted-foreground">Pro Account</div>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
