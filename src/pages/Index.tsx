import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { ProductSuggestions } from "@/components/ProductSuggestions";
import { useIsMobile } from "@/hooks/use-mobile";

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
    }
  }, [session, navigate]);

  if (!session) {
    return null; // Loading state
  }

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden relative justify-center bg-background">
      <div className={`flex h-full min-h-0 w-full max-w-[1920px] overflow-hidden relative ${isMobile ? 'flex-col' : ''}`}>
        <ChatSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className={`flex flex-1 min-h-0 ${isMobile ? 'flex-col' : ''}`}>
          <ProductSuggestions onChatToggle={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />
          <ChatInterface isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
        </div>
      </div>
    </div>
  );
};

export default Index;
