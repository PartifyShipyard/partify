import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Hash, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";

interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  timestamp: string;
  metadata?: any;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onToggle: () => void;
  messages?: Message[];
  isLoading?: boolean;
  onSendMessage?: (message: string, searchByPartNumber: boolean) => void;
}

export const ChatInterface = ({ 
  isOpen, 
  onToggle,
  messages: externalMessages = [],
  isLoading: externalLoading = false,
  onSendMessage,
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [searchByPartNumber, setSearchByPartNumber] = useState(false);
  const [useFloatingMode, setUseFloatingMode] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use external messages or local state
  const messages = externalMessages;
  const isLoading = externalLoading;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    console.log('ChatInterface: 💬 Messages updated, count:', messages?.length || 0);
    console.log('ChatInterface: 🎨 UI re-rendering with new messages');
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

  const handleSend = async () => {
    if (!input.trim()) return;

    const messageContent = input;
    setInput("");
    setPendingMessage(messageContent); // Show message immediately

    if (onSendMessage) {
      await onSendMessage(messageContent, searchByPartNumber);
    }
    
    setPendingMessage(null); // Clear pending message after response
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

      <div className={`flex flex-col bg-background transition-all duration-300 ease-in-out
        ${useFloatingMode
          ? `fixed z-50 inset-0 w-full h-full ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`
          : `relative z-0 h-screen ${isOpen ? 'w-96 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`
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
      <ScrollArea className="flex-1 px-6 min-h-0 overflow-hidden transition-opacity duration-300">
        <div className="space-y-4 py-6">
          {messages && messages.length > 0 ? (
            messages.map((message) => {
              try {
                // Debug: Log message metadata
                if (message.role === 'assistant' && message.metadata) {
                  console.log('ChatInterface: Message metadata:', message.id, message.metadata);
                }
                
                return (
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
                      <p className="text-sm break-words">{message.content || ''}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              } catch (error) {
                console.error('Error rendering message:', message, error);
                return null;
              }
            })
          ) : (
            !isLoading && (
              <div className="flex items-center justify-center h-full px-6">
                <div className="max-w-md text-center space-y-6">
                  {/* Icon */}
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <Search className="h-16 w-16 text-muted-foreground/40" />
                      <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1" />
                    </div>
                  </div>
                  
                  {/* Welcome Message */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Start Your Search
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Describe the spare part you're looking for, and I'll help you find the best options with pricing and availability.
                    </p>
                  </div>
                  
                  {/* Examples */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Try asking:
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="rounded-lg bg-muted/50 px-3 py-2 text-left">
                        <p className="text-xs text-muted-foreground">
                          "Find me an iPhone 14 Pro screen"
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 px-3 py-2 text-left">
                        <p className="text-xs text-muted-foreground">
                          "Search for Samsung Galaxy S23 battery"
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 px-3 py-2 text-left">
                        <p className="text-xs text-muted-foreground">
                          "LCD-IP14P-OL" (search by part number)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
          {/* Show pending user message immediately */}
          {pendingMessage && (
            <div className="flex justify-end animate-fade-in-up">
              <div className="max-w-[80%] rounded-lg px-4 py-3 bg-primary text-primary-foreground">
                <p className="text-sm break-words">{pendingMessage}</p>
                <p className="mt-1 text-xs opacity-70">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )}
          {/* Show typing animation while loading */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="rounded-lg bg-card px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
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
