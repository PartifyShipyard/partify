# API Integration Guide

This document explains how the frontend is integrated with the backend API at `https://65.109.143.117/api`.

**✅ This integration is now fully aligned with the OpenAPI specification at `https://65.109.143.117/api/openapi.json`**

## Setup

### Installation
Axios has been installed for HTTP requests:
```bash
npm install axios
```

### API Service Layer

The API service is located at `/src/services/api.ts` and provides a centralized way to interact with the backend.

#### Configuration
```typescript
const API_BASE_URL = 'https://65.109.143.117/api';
```

You can change this URL in `/src/services/api.ts` if needed.

## Authentication

### Token Management
- **Access Token**: Stored as `access_token` in localStorage
- **Refresh Token**: Stored as `refresh_token` in localStorage
- Tokens are automatically included in all authenticated requests as: `Authorization: Bearer {access_token}`

## API Structure

### Authentication
All API requests automatically include the auth token from localStorage:
```typescript
Authorization: Bearer {token}
```

The token is stored after successful login and removed on logout.

### Available Endpoints

#### Chat Endpoints
```typescript
// Send a message (returns both user and assistant messages + suggested products)
apiService.chat.sendMessage(message, searchByPartNumber, conversationId?)
// Returns: { conversationId, conversation, userMessage, assistantMessage, suggestedProducts? }

// List conversations with pagination
apiService.chat.listConversations(page?, limit?)
// Returns: { conversations: [], pagination: { page, limit, total } }

// Create new conversation
apiService.chat.createConversation(title?)

// Get specific conversation with all messages
apiService.chat.getConversation(conversationId)
// Returns: { id, userId, title, messages, createdAt, lastMessageAt }

// Delete conversation
apiService.chat.deleteConversation(conversationId)
```

#### Product Endpoints
```typescript
// List products with pagination
apiService.products.list(page?, limit?)
// Returns: { products: [], pagination: {}, filters: {} }

// Search products
apiService.products.search({
  query: string,
  searchByPartNumber?: boolean,
  filters?: {
    brands?: string[],
    models?: string[],
    availability?: string[]
  },
  sortBy?: string
})
// Returns: { products: [], pagination: {} }

// Get product by ID (integer)
apiService.products.getById(productId)

// Create product (requires auth)
apiService.products.create(productData)

// Update product (requires auth)
apiService.products.update(productId, updates)

// Delete product (requires auth)
apiService.products.delete(productId)

// Get available filters
apiService.products.getFilters()
```

#### Auth Endpoints
```typescript
// Login - returns access and refresh tokens
apiService.auth.login(email, password)
// Returns: { user, accessToken, refreshToken }

// Register - requires fullName
apiService.auth.register(email, password, fullName)
// Returns: { user, accessToken, refreshToken }

// Logout - clears tokens
apiService.auth.logout()

// Refresh access token
apiService.auth.refreshToken()
// Returns: { accessToken, refreshToken }
```

#### Profile Endpoints
```typescript
// Get profile
apiService.profile.get()

// Update profile
apiService.profile.update(data)

// Update avatar
apiService.profile.updateAvatar(file)
```

## React Hooks

### useChat Hook
Located at `/src/hooks/useChat.ts`

```typescript
const {
  messages,          // Current conversation messages
  history,           // Chat history list
  isLoading,         // Loading state
  sendMessage,       // Function to send a message
  loadHistory,       // Load chat history
  loadConversation,  // Load specific conversation
  deleteConversation,// Delete a conversation
  clearAllHistory,   // Clear all history
  startNewConversation // Start new conversation
} = useChat();
```

### useProducts Hook
Located at `/src/hooks/useProducts.ts`

```typescript
const {
  products,          // Product list
  isLoading,         // Loading state
  isSearching,       // Search in progress
  searchProducts,    // Search function
  getProduct,        // Get single product
  createProduct,     // Create new product
  updateProduct,     // Update product
  deleteProduct,     // Delete product
  setProducts        // Manually set products
} = useProducts();
```

## Integration with Components

### ChatInterface Component
To integrate the chat with the API:

```typescript
import { useChat } from '@/hooks/useChat';

export const ChatInterface = () => {
  const { messages, isLoading, sendMessage, loadHistory } = useChat();
  
  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);
  
  // Send message
  const handleSubmit = async (input: string) => {
    await sendMessage(input);
  };
  
  // ...rest of component
};
```

### ProductSuggestions Component
To integrate product search with the API:

```typescript
import { useProducts } from '@/hooks/useProducts';

export const ProductSuggestions = () => {
  const { products, isSearching, searchProducts } = useProducts();
  
  // Search products
  const handleSearch = async (query: string) => {
    await searchProducts({
      query,
      filters: {
        brands: selectedBrands,
        models: selectedModels,
      },
      sortBy: sortOption,
    });
  };
  
  // ...rest of component
};
```

### ChatSidebar Component
To integrate chat history with the API:

```typescript
import { useChat } from '@/hooks/useChat';

export const ChatSidebar = () => {
  const { 
    history, 
    loadHistory, 
    deleteConversation, 
    clearAllHistory,
    loadConversation 
  } = useChat();
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  // ...rest of component
};
```

## Error Handling

All API calls include error handling:
- Network errors show toast notifications
- 401 (Unauthorized) automatically redirects to `/auth`
- Error messages from the API are displayed to the user

## Next Steps

1. **Review API Documentation**: Check the actual API docs at `https://65.109.143.117/api/docs` to ensure endpoint paths and request/response formats match.

2. **Update Endpoint Paths**: If the API paths differ from what's implemented, update them in `/src/services/api.ts`.

3. **Add Type Definitions**: If the API responses have different structures, update the TypeScript interfaces in `/src/services/api.ts`.

4. **Test Integration**: Test each endpoint to ensure proper communication with the backend.

5. **Environment Variables**: Consider moving the API URL to an environment variable:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://65.109.143.117/api';
   ```

6. **Update Components**: Replace mock data in components with the API hooks created.

## Security Notes

- The API uses Bearer token authentication
- Tokens are stored in localStorage
- HTTPS is used for all API communications
- CORS should be configured on the backend to allow requests from your frontend domain

## Testing

You can test API calls directly in the browser console:

```javascript
import { apiService } from './src/services/api';

// Test product search
apiService.products.search({ query: 'brake pads' })
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify API is accessible at `https://65.109.143.117/api`
3. Check network tab in browser DevTools
4. Ensure CORS is properly configured on the backend

