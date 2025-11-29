import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { ProductSuggestions } from "@/components/ProductSuggestions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/hooks/useChat";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const isMobile = useIsMobile();
  const [isChatOpen, setIsChatOpen] = useState(() => {
    // Start closed if viewport is too small for chat to fit inline
    const chatWidth = 384;
    const minContentWidth = 400;
    const sidebarWidth = 256;
    const totalNeeded = sidebarWidth + minContentWidth + chatWidth;
    return window.innerWidth >= totalNeeded;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Chat hook for managing conversations
  const {
    messages,
    history,
    isLoading: isChatLoading,
    suggestedProducts,
    sendMessage,
    loadHistory,
    loadConversation,
    deleteConversation,
    createConversation,
    startNewConversation,
  } = useChat();

  const handleNewChat = async () => {
    // Create a new conversation via API
    console.log('Starting new conversation...');
    startNewConversation();
    setIsChatOpen(true); // Open chat when starting new conversation
  };

  const handleSelectChat = async (conversationId: number) => {
    // Load the selected conversation
    console.log('Index: Loading conversation:', conversationId);
    try {
      const result = await loadConversation(conversationId);
      console.log('Index: Conversation loaded, suggestedProducts:', suggestedProducts);
      // Only open chat if conversation loaded successfully
      if (result) {
        setIsChatOpen(true);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      // Error is already shown via toast in loadConversation
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  useEffect(() => {
    if (session === null) {
      // Wait a moment to see if we're loading the session
      const timeout = setTimeout(() => {
        if (!session) {
          navigate("/auth");
        }
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      // Load chat history when user is authenticated
      loadHistory();
    }
  }, [session, navigate, loadHistory]);

  if (!session) {
    return null; // Loading state
  }

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden relative justify-center bg-background">
      <div className={`flex h-full min-h-0 w-full max-w-[1920px] overflow-hidden relative ${isMobile ? 'flex-col' : ''}`}>
        <ChatSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNewChat={handleNewChat}
          history={history}
          onSelectChat={handleSelectChat}
          onDeleteChat={deleteConversation}
        />
        <div className={`flex flex-1 min-h-0 ${isMobile ? 'flex-col' : ''}`}>
          <ErrorBoundary>
            <ProductSuggestions 
              onChatToggle={() => setIsChatOpen(!isChatOpen)} 
              isChatOpen={isChatOpen}
              products={suggestedProducts}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <ChatInterface 
              isOpen={isChatOpen} 
              onToggle={() => setIsChatOpen(!isChatOpen)}
              messages={messages}
              isLoading={isChatLoading}
              onSendMessage={sendMessage}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Index;
