import { apiClient } from '@/lib/api-client';

export interface Property {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  type: 'house' | 'apartment' | 'commercial' | 'land' | 'farm';
  transactionType: 'sale' | 'rent' | 'both';
  price?: number;
  rentPrice?: number;
  address: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  parkingSpaces?: number;
  features?: string[];
  location?: {
    lat: number;
    lng: number;
  };
  status: 'available' | 'reserved' | 'sold' | 'rented' | 'unavailable';
  images?: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  ownerId?: string;
  brokerId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  type?: string;
  transactionType?: string;
  status?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  page?: number;
  limit?: number;
}

export const propertiesService = {
  async getProperties(filters?: PropertyFilters) {
    const response = await apiClient.get<{ data: Property[]; pagination: any }>('/properties', {
      params: filters
    });
    return response.data;
  },

  async getPropertyById(id: string) {
    const response = await apiClient.get<{ data: Property }>(`/properties/${id}`);
    return response.data;
  },

  async createProperty(data: Partial<Property>) {
    const response = await apiClient.post<{ data: Property }>('/properties', data);
    return response.data;
  },

  async updateProperty(id: string, data: Partial<Property>) {
    const response = await apiClient.put<{ data: Property }>(`/properties/${id}`, data);
    return response.data;
  },

  async deleteProperty(id: string) {
    await apiClient.delete(`/properties/${id}`);
  },

  async generateDescription(id: string, tone: 'professional' | 'luxury' | 'casual' | 'persuasive' = 'professional') {
    const response = await apiClient.post<{ data: any }>(`/properties/${id}/generate-description`, { tone });
    return response.data;
  }
};
