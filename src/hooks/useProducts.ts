import { useState, useCallback } from 'react';
import { apiService, Product, SearchParams } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchProducts = useCallback(async (params: SearchParams) => {
    setIsSearching(true);
    try {
      const data = await apiService.products.search(params);
      setProducts(data.products);
      return data.products;
    } catch (error: any) {
      toast({
        title: 'Search Error',
        description: error.response?.data?.message || error.response?.data?.detail || 'Failed to search products',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const getProduct = useCallback(async (productId: number) => {
    setIsLoading(true);
    try {
      const data = await apiService.products.getById(productId);
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.response?.data?.detail || 'Failed to get product',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const data = await apiService.products.create(product);
      setProducts((prev) => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.response?.data?.detail || 'Failed to create product',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateProduct = useCallback(async (productId: number, updates: Partial<Product>) => {
    setIsLoading(true);
    try {
      const data = await apiService.products.update(productId, updates);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? data : p))
      );
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.response?.data?.detail || 'Failed to update product',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteProduct = useCallback(async (productId: number) => {
    setIsLoading(true);
    try {
      await apiService.products.delete(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.response?.data?.detail || 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    products,
    isLoading,
    isSearching,
    searchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    setProducts,
  };
};

