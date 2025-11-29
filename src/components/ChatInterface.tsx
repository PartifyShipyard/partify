import { useState, useEffect } from "react";
import { MessageSquare, Send, Loader2, X, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI assistant for finding spare parts. What are you looking for today?",
    timestamp: new Date(),
  },
];

interface ChatInterfaceProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatInterface = ({ isOpen, onToggle }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchByPartNumber, setSearchByPartNumber] = useState(false);
  const [useFloatingMode, setUseFloatingMode] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const chatWidth = 384; // w-96 = 384px
      const minContentWidth = 400; // Minimum space needed for content
      const sidebarWidth = 256; // Approximate sidebar width when open
      const totalNeeded = sidebarWidth + minContentWidth + chatWidth;

      setUseFloatingMode(window.innerWidth < totalNeeded);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responseContent = searchByPartNumber
        ? `Searching for part number: ${input}. I'll look for exact matches in our catalog.`
        : "I found several parts matching your search. Check the suggestions panel for details and pricing.";
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* Backdrop for floating mode */}
      {isOpen && useFloatingMode && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      <div className={`flex h-full flex-col bg-background transition-all duration-300 ease-in-out
        ${useFloatingMode
          ? `fixed z-50 inset-0 w-full ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`
          : `relative z-0 ${isOpen ? 'w-96 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`
        }
      `}>
      {/* Chat Header */}
      <div className="h-[88px] flex items-center px-4 flex-shrink-0 transition-opacity duration-300">
        <div className="flex items-start justify-between w-full">
          <div className="min-w-0 flex-1 pr-2">
            <h1 className="text-xl font-semibold text-foreground truncate">Search Spare Parts</h1>
            <p className="text-sm text-muted-foreground truncate">Describe what you need and I'll help you find it</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggle} className="flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 min-h-0 transition-opacity duration-300">
        <div className="space-y-4 py-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 break-words transition-all duration-200 ease-in-out ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground"
                }`}
              >
                <p className="text-sm break-words">{message.content}</p>
                <p className="mt-1 text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-card px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 flex-shrink-0 transition-opacity duration-300">
        <div className="flex items-center gap-2 mb-2">
          <Toggle
            pressed={searchByPartNumber}
            onPressedChange={setSearchByPartNumber}
            size="sm"
            aria-label="Search by part number"
          >
            <Hash className="h-4 w-4 mr-1" />
            <span className="text-xs">Part Number</span>
          </Toggle>
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              searchByPartNumber
                ? "Enter part number (e.g., LCD-IP14P-OL)..."
                : "Describe the part you're looking for..."
            }
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    </>
  );
};
