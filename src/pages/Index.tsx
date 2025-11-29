import { useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { ProductSuggestions } from "@/components/ProductSuggestions";

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar />
      <div className="flex flex-1">
        <ProductSuggestions />
        <ChatInterface isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
      </div>
    </div>
  );
};

export default Index;
