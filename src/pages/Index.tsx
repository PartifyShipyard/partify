import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { ProductSuggestions } from "@/components/ProductSuggestions";

const Index = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar />
      <div className="flex flex-1">
        <ProductSuggestions />
        <ChatInterface />
      </div>
    </div>
  );
};

export default Index;
