import { History, Plus, User, Settings, Moon, Sun, Menu, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { useState } from "react";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHistory {
  id: string;
  title: string;
  date: string;
}

const initialHistory: ChatHistory[] = [
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
  const [history, setHistory] = useState<ChatHistory[]>(initialHistory);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();

  const clearAllHistory = () => {
    setHistory([]);
    setShowClearDialog(false);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Mobile Top Bar Navigation
  if (isMobile) {
    return (
      <>
        <div className="flex h-16 w-full items-center justify-between bg-background px-4">
          <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full p-0">
              <div className="flex h-full flex-col">
                {/* Mobile Menu Header */}
                <SheetHeader className="border-b border-border p-4">
                  <SheetTitle>partify</SheetTitle>
                </SheetHeader>

                {/* Chat History in Sheet */}
                <ScrollArea className="flex-1 px-3">
                  <div className="space-y-1 py-4">
                    <div className="mb-2 flex items-center justify-between px-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <History className="h-4 w-4" />
                        <span>Recent Searches</span>
                      </div>
                      {history.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setShowClearDialog(true)}
                          title="Clear all history"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {history.length === 0 ? (
                      <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                        No search history
                      </div>
                    ) : (
                      history.map((chat) => (
                        <div
                          key={chat.id}
                          className="group relative w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <div className="pr-8">
                            <div className="font-medium text-foreground">{chat.title}</div>
                            <div className="text-xs text-muted-foreground">{chat.date}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => deleteHistoryItem(chat.id)}
                            title="Delete search"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Account Section in Sheet */}
                <div className="p-3">
                  <UserProfileDropdown showName={true} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <h2 className="text-lg font-semibold text-foreground">partify</h2>

          <div className="flex gap-1">
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
          </div>
        </div>

        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your search history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearAllHistory}>Clear All</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Desktop Sidebar Navigation
  return (
    <div className={`flex h-screen flex-col bg-background transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className={`flex items-center h-[72px] px-4 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <h2 className="text-lg font-semibold text-foreground transition-opacity duration-300">partify</h2>}
        <div className={`flex gap-1 transition-all duration-300 ${isCollapsed ? 'flex-col' : ''}`}>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <Menu className="h-4 w-4" />
          </Button>
          {!isCollapsed && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="transition-opacity duration-300"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="transition-opacity duration-300">
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-3 transition-all duration-300">
        {!isCollapsed ? (
          <div className="space-y-1 py-4 transition-opacity duration-300">
            <div className="mb-2 flex items-center justify-between px-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <History className="h-4 w-4" />
                <span>Recent Searches</span>
              </div>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowClearDialog(true)}
                  title="Clear all history"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No search history
              </div>
            ) : (
              history.map((chat) => (
                <div
                  key={chat.id}
                  className="group relative w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  <div className="pr-8">
                    <div className="font-medium text-foreground">{chat.title}</div>
                    <div className="text-xs text-muted-foreground">{chat.date}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => deleteHistoryItem(chat.id)}
                    title="Delete search"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4 transition-opacity duration-300">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle} title="Open navigation">
              <History className="h-4 w-4" />
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Account Section */}
      <div className="p-3 transition-all duration-300">
        {!isCollapsed ? (
          <UserProfileDropdown showName={true} />
        ) : (
          <div className="flex justify-center">
            <UserProfileDropdown showName={false} />
          </div>
        )}
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your search history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllHistory}>Clear All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
