import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { ProductSuggestions } from "@/components/ProductSuggestions";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
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
    <div className="flex h-full min-h-0 w-full overflow-hidden relative">
      <ChatSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <div className="flex flex-1 min-h-0">
        <ProductSuggestions />
        <ChatInterface isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50"
        onClick={() => navigate("/settings")}
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default Index;
