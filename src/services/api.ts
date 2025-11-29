import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_BASE_URL = 'https://65.109.143.117/api';

// Debug logger function (set by DebugProvider)
let debugLogger: ((log: any) => void) | null = null;

export const setDebugLogger = (logger: ((log: any) => void) | null) => {
  debugLogger = logger;
};

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and log requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Store request data for logging
    (config as any)._requestTime = Date.now();
    (config as any)._requestData = config.data;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for error handling, logging, and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    if (debugLogger) {
      const config = response.config as any;
      debugLogger({
        method: config.method?.toUpperCase() || 'GET',
        url: config.url || '',
        status: response.status,
        requestData: config._requestData,
        responseData: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Log error response
    if (debugLogger) {
      debugLogger({
        method: originalRequest?.method?.toUpperCase() || 'GET',
        url: originalRequest?.url || '',
        status: error.response?.status,
        requestData: originalRequest?._requestData,
        responseData: error.response?.data,
        error: {
          message: error.message,
          code: error.code,
          response: error.response?.data,
        },
      });
    }

    // Handle 401 Unauthorized errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if this is the refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh')) {
        console.log('Refresh token expired, clearing tokens');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        console.log('No refresh token available');
        localStorage.removeItem('access_token');
        window.location.href = '/auth';
        return Promise.reject(error);
      }

      try {
        console.log('Attempting to refresh access token...');
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Update tokens
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        console.log('Token refreshed successfully');
        
        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Process queued requests
        processQueue(null, accessToken);
        
        isRefreshing = false;
        
        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth';
        
        return Promise.reject(refreshError);
      }
    }

    // For all other errors, reject normally
    return Promise.reject(error);
  }
);

// API Service Types (from OpenAPI spec)
export interface Product {
  id: number;
  name: string;
  partNumber: string;
  brand: string;
  price: number;
  shippingCost: number;
  estimatedShipping: string;
  validatedByManufacturer: boolean;
  availability: string;
  images: string[];
  description: string;
  compatibleModels: string[];
  shippingCountry: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  // Custom fields (not in API spec)
  purchasingUrl?: string;
}

export interface MessageMetadata {
  searchType?: string | null;
  productIds?: number[] | null;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  timestamp: string;
  metadata?: MessageMetadata | null;
}

export interface ConversationSummary {
  id: number;
  userId: number;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatHistory extends ConversationSummary {
  messageCount?: number; // Custom field for UI
}

export interface SearchParams {
  query: string;
  searchByPartNumber?: boolean;
  filters?: {
    brands?: string[];
    models?: string[];
    availability?: string[];
  };
  sortBy?: string;
}

// API Service Methods
export const apiService = {
  // Chat endpoints (from OpenAPI spec)
  chat: {
    sendMessage: async (
      message: string, 
      searchByPartNumber: boolean, 
      conversationId?: number
    ): Promise<{
      conversationId: number;
      conversation: ConversationSummary;
      userMessage: ChatMessage;
      assistantMessage: ChatMessage;
      suggestedProducts?: Product[] | null;
    }> => {
      const response = await apiClient.post('/chat/message', {
        message,
        searchByPartNumber,
        conversationId: conversationId || null,
      });
      return response.data;
    },

    listConversations: async (skip: number = 0, limit: number = 20): Promise<{
      conversations: ConversationSummary[];
      pagination: { skip: number; limit: number; total: number };
    }> => {
      const response = await apiClient.get('/chat/conversations', {
        params: { skip, limit },
      });
      return response.data;
    },

    createConversation: async (title?: string): Promise<ConversationSummary> => {
      const response = await apiClient.post('/chat/conversations', { 
        title: title || 'New Conversation'
      });
      return response.data;
    },

    getConversation: async (conversationId: number): Promise<{
      id: number;
      userId: number;
      title: string;
      lastMessageAt: string;
      createdAt: string;
      messages: ChatMessage[];
    }> => {
      const response = await apiClient.get(`/chat/conversations/${conversationId}`);
      return response.data;
    },

    deleteConversation: async (conversationId: number): Promise<{
      message: string;
    }> => {
      const response = await apiClient.delete(`/chat/conversations/${conversationId}`);
      return response.data;
    },
  },

  // Product search endpoints
  products: {
    list: async (page: number = 1, limit: number = 10): Promise<{
      products: Product[];
      pagination: { page: number; limit: number; total: number };
      filters: any;
    }> => {
      const response = await apiClient.get('/products', {
        params: { page, limit },
      });
      return response.data;
    },

    search: async (params: SearchParams): Promise<{
      products: Product[];
      pagination: { page: number; limit: number; total: number };
    }> => {
      const response = await apiClient.post('/products/search', params);
      return response.data;
    },

    getById: async (productId: number): Promise<Product> => {
      const response = await apiClient.get(`/products/${productId}`);
      return response.data;
    },

    getByIds: async (productIds: number[]): Promise<Product[]> => {
      // Fetch multiple products by IDs
      if (productIds.length === 0) return [];
      
      try {
        // Use Promise.all to fetch all products in parallel
        const productPromises = productIds.map(id => apiClient.get(`/products/${id}`));
        const responses = await Promise.all(productPromises);
        return responses.map(response => response.data);
      } catch (error) {
        console.error('Error fetching products by IDs:', error);
        return [];
      }
    },

    create: async (product: Omit<Product, 'id'>): Promise<Product> => {
      const response = await apiClient.post('/products', product);
      return response.data;
    },

    update: async (productId: number, product: Partial<Product>): Promise<Product> => {
      const response = await apiClient.put(`/products/${productId}`, product);
      return response.data;
    },

    delete: async (productId: number): Promise<void> => {
      await apiClient.delete(`/products/${productId}`);
    },

    getFilters: async (): Promise<any> => {
      const response = await apiClient.get('/products/filters/all');
      return response.data;
    },
  },

  // Auth endpoints
  auth: {
    login: async (email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: any }> => {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
        localStorage.setItem('refresh_token', response.data.refreshToken);
      }
      return response.data;
    },

    register: async (email: string, password: string, fullName: string): Promise<{ accessToken: string; refreshToken: string; user: any }> => {
      const response = await apiClient.post('/auth/register', { email, password, fullName });
      if (response.data.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
        localStorage.setItem('refresh_token', response.data.refreshToken);
      }
      return response.data;
    },

    logout: async (): Promise<void> => {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },

    refreshToken: async (): Promise<{ accessToken: string; refreshToken: string }> => {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      if (response.data.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
        localStorage.setItem('refresh_token', response.data.refreshToken);
      }
      return response.data;
    },
  },

  // User profile endpoints
  profile: {
    get: async (): Promise<any> => {
      const response = await apiClient.get('/profile');
      return response.data;
    },

    update: async (data: any): Promise<any> => {
      const response = await apiClient.put('/profile', data);
      return response.data;
    },

    updateAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await apiClient.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  },
};

export default apiService;

