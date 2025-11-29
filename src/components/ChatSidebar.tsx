import { History, Plus, User, Settings, Moon, Sun, Menu, X, Trash2, Bug } from "lucide-react";
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
import { useDebug } from "@/contexts/DebugContext";
import { Toggle } from "@/components/ui/toggle";

interface ChatHistory {
  id: number;
  userId: number;
  title: string;
  lastMessageAt: string;
  createdAt: string;
  messageCount: number;
}

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNewChat?: () => void;
  history?: ChatHistory[];
  onSelectChat?: (conversationId: number) => void;
  onDeleteChat?: (conversationId: number) => void;
}

export const ChatSidebar = ({ 
  isCollapsed, 
  onToggle, 
  onNewChat,
  history = [],
  onSelectChat,
  onDeleteChat,
}: ChatSidebarProps) => {
  const { theme, setTheme } = useTheme();
  const { debugMode, toggleDebugMode } = useDebug();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();

  const clearAllHistory = () => {
    // Clear all conversations - not implemented in API
    setShowClearDialog(false);
  };

  const deleteHistoryItem = (id: number) => {
    if (onDeleteChat) {
      onDeleteChat(id);
    }
  };

  const handleChatClick = (id: number) => {
    if (onSelectChat) {
      onSelectChat(id);
    }
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
                <SheetHeader className="p-4">
                  <SheetTitle className="flex items-center gap-2">
                    partify
                    <span className="text-xs font-normal text-muted-foreground">beta</span>
                  </SheetTitle>
                </SheetHeader>

                {/* Chat History in Sheet */}
                <ScrollArea className="flex-1 px-3">
                  <div className="space-y-1 py-4">
                    {/* Debug Mode Toggle */}
                    <div className="mb-3 px-3">
                      <Toggle
                        pressed={debugMode}
                        onPressedChange={toggleDebugMode}
                        size="sm"
                        className="w-full justify-start gap-2"
                        aria-label="Toggle debug mode"
                      >
                        <Bug className="h-4 w-4" />
                        <span className="text-xs">Debug Mode</span>
                      </Toggle>
                    </div>
                    
                    <div className="mb-2 flex items-center justify-between px-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <History className="h-4 w-4" />
                        <span>Recent Chats</span>
                      </div>
                    </div>
                    {history.length === 0 ? (
                      <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                        No chat history
                      </div>
                    ) : (
                      history.map((chat) => (
                        <div
                          key={chat.id}
                          className="group relative w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent cursor-pointer"
                          onClick={() => handleChatClick(chat.id)}
                        >
                          <div className="pr-8">
                            <div className="font-medium text-foreground">{chat.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {chat.messageCount} messages • {new Date(chat.lastMessageAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHistoryItem(chat.id);
                            }}
                            title="Delete conversation"
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

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">partify</h2>
            <span className="text-xs text-muted-foreground">beta</span>
          </div>

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
            <Button variant="ghost" size="icon" onClick={onNewChat}>
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
        {!isCollapsed && (
          <div className="flex items-center gap-2 transition-opacity duration-300">
            <h2 className="text-lg font-semibold text-foreground">partify</h2>
            <span className="text-xs text-muted-foreground">beta</span>
          </div>
        )}
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
              <Button variant="ghost" size="icon" className="transition-opacity duration-300" onClick={onNewChat}>
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
            {/* Debug Mode Toggle */}
            <div className="mb-3 px-3">
              <Toggle
                pressed={debugMode}
                onPressedChange={toggleDebugMode}
                size="sm"
                className="w-full justify-start gap-2"
                aria-label="Toggle debug mode"
              >
                <Bug className="h-4 w-4" />
                <span className="text-xs">Debug Mode</span>
              </Toggle>
            </div>
            
            <div className="mb-2 flex items-center justify-between px-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <History className="h-4 w-4" />
                <span>Recent Chats</span>
              </div>
            </div>
            {history.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No chat history
              </div>
            ) : (
              history.map((chat) => (
                <div
                  key={chat.id}
                  className="group relative w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent cursor-pointer"
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="pr-8">
                    <div className="font-medium text-foreground">{chat.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {chat.messageCount} messages • {new Date(chat.lastMessageAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryItem(chat.id);
                    }}
                    title="Delete conversation"
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
