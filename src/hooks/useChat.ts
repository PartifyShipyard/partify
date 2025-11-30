import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService, ChatMessage, ChatHistory, Product } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>();
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string, searchByPartNumber: boolean = false) => {
    setIsLoading(true);
    try {
      // Send to API
      const response = await apiService.chat.sendMessage(content, searchByPartNumber, currentConversationId);
      
      console.log('useChat: Got response:', {
        conversationId: response.conversationId,
        assistantMessage: response.assistantMessage,
        metadata: response.assistantMessage?.metadata
      });
      
      // Set conversation ID if new
      const convId = response.conversationId || currentConversationId;
      if (convId && !currentConversationId) {
        setCurrentConversationId(convId);
      }
      
      // Add both messages to state
      setMessages((prev) => [...prev, response.userMessage, response.assistantMessage]);
      
      // Check if assistant message has product IDs in metadata
      if (response.assistantMessage?.metadata?.productIds && Array.isArray(response.assistantMessage.metadata.productIds)) {
        const productIds = response.assistantMessage.metadata.productIds;
        console.log('useChat: Assistant message has product IDs in metadata:', productIds);
        
        // Fetch products from API
        try {
          const products = await apiService.products.getByIds(productIds);
          console.log('useChat: Fetched products for new message:', products.length);
          setSuggestedProducts([...products]); // Force new reference
        } catch (error) {
          console.error('useChat: Failed to fetch products for new message:', error);
          // Fall back to suggestedProducts if API fetch fails
          if (response.suggestedProducts) {
            console.log('useChat: Using fallback suggestedProducts from response');
            setSuggestedProducts([...response.suggestedProducts]); // Force new reference
          }
        }
      }
      // Fall back to suggestedProducts if no productIds in metadata
      else if (response.suggestedProducts) {
        console.log('useChat: Using suggestedProducts from response');
        setSuggestedProducts([...response.suggestedProducts]); // Force new reference
      }
      
      // Add the new conversation to history if it's new
      if (convId && !currentConversationId && response.conversation) {
        setHistory((prev) => [response.conversation, ...prev]);
      }

      return response;
    } catch (error: any) {
      console.error('Chat API Error:', error);
      toast({
        title: 'Chat Error',
        description: error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to send message',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, toast]);

  const loadHistory = useCallback(async (skip: number = 0, limit: number = 20) => {
    try {
      const data = await apiService.chat.listConversations(skip, limit);
      setHistory(data.conversations);
      return data;
    } catch (error: any) {
      console.error('Load History Error:', error);
      toast({
        title: 'History Error',
        description: error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to load chat history',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const loadConversation = useCallback(async (conversationId: number) => {
    setIsLoading(true);
    setSuggestedProducts([]); // Clear products immediately when switching chats
    try {
      const conversation = await apiService.chat.getConversation(conversationId);
      console.log('useChat: Loaded conversation', {
        id: conversation.id,
        messagesCount: conversation.messages?.length || 0,
        messages: conversation.messages
      });
      
      setMessages(conversation.messages || []);
      setCurrentConversationId(conversationId);
      
      // Extract product IDs from the LATEST message that has them in metadata
      let latestProductIds: number[] = [];
      
      if (conversation.messages && conversation.messages.length > 0) {
        // Iterate through messages in reverse (latest first)
        for (let i = conversation.messages.length - 1; i >= 0; i--) {
          const message = conversation.messages[i];
          
          // Check if message has metadata with productIds
          if (message.metadata && message.metadata.productIds && Array.isArray(message.metadata.productIds)) {
            latestProductIds = message.metadata.productIds;
            console.log('useChat: Found product IDs in message', {
              messageId: message.id,
              role: message.role,
              productIds: latestProductIds
            });
            break; // Stop after finding the latest message with products
          }
        }
      }
      
      // Fetch products from API if we found product IDs
      if (latestProductIds.length > 0) {
        console.log('useChat: Fetching products from API with IDs:', latestProductIds);
        try {
          const products = await apiService.products.getByIds(latestProductIds);
          console.log('useChat: Fetched products from API:', products.length);
          setSuggestedProducts([...products]); // Force new reference
        } catch (error) {
          console.error('useChat: Failed to fetch products:', error);
          toast({
            title: 'Product Fetch Error',
            description: 'Failed to load product details',
            variant: 'destructive',
          });
          setSuggestedProducts([]);
        }
      } else {
        console.log('useChat: No product IDs found in messages, clearing products');
        setSuggestedProducts([]);
      }
      
      return conversation;
    } catch (error: any) {
      console.error('Load Conversation Error:', error);
      toast({
        title: 'Conversation Error',
        description: error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to load conversation',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteConversation = useCallback(async (conversationId: number) => {
    try {
      await apiService.chat.deleteConversation(conversationId);
      setHistory((prev) => prev.filter((h) => h.id !== conversationId));
      
      // If we deleted the current conversation, clear it
      if (currentConversationId === conversationId) {
        setCurrentConversationId(undefined);
        setMessages([]);
        setSuggestedProducts([]); // Clear products when deleting current conversation
      }
      
      toast({
        title: 'Success',
        description: 'Conversation deleted',
      });
    } catch (error: any) {
      console.error('Delete Conversation Error:', error);
      toast({
        title: 'Delete Error',
        description: error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to delete conversation',
        variant: 'destructive',
      });
    }
  }, [toast, currentConversationId]);

  const createConversation = useCallback(async (title?: string) => {
    try {
      const conversation = await apiService.chat.createConversation(title);
      setHistory((prev) => [conversation, ...prev]);
      setCurrentConversationId(conversation.id);
      setMessages([]);
      return conversation;
    } catch (error: any) {
      console.error('Create Conversation Error:', error);
      toast({
        title: 'Create Error',
        description: error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to create conversation',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const startNewConversation = useCallback(() => {
    console.log('Starting new conversation - clearing messages and conversation ID');
    setMessages([]);
    setCurrentConversationId(undefined);
    setSuggestedProducts([]);
  }, []);

  return {
    messages,
    history,
    isLoading,
    suggestedProducts,
    currentConversationId,
    sendMessage,
    loadHistory,
    loadConversation,
    deleteConversation,
    createConversation,
    startNewConversation,
  };
};

