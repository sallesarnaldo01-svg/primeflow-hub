import { apiClient } from '@/lib/api-client';

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  tags: string[];
  order: number;
  createdAt: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  sku?: string;
  stock: number;
  active: boolean;
  metadata?: any;
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category?: string;
  sku?: string;
  stock?: number;
  metadata?: any;
  images?: {
    url: string;
    tags: string[];
    order?: number;
  }[];
}

export const productsService = {
  async list(category?: string, active?: boolean): Promise<Product[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (active !== undefined) params.append('active', String(active));
    
    const response = await apiClient.get<Product[]>(`/products?${params}`);
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  async create(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateProductData>): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async addImage(productId: string, url: string, tags: string[], order?: number): Promise<ProductImage> {
    const response = await apiClient.post<ProductImage>(`/products/${productId}/images`, { url, tags, order });
    return response.data;
  }
};
