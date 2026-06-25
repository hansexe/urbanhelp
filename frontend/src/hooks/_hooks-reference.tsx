// frontend/lib/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
          if (refreshToken) {
            try {
              const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
              localStorage.setItem('accessToken', response.data.data.accessToken);
              return this.client.request(error.config!);
            } catch (err) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/auth/login';
            }
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async register(data: any) {
    return this.client.post('/auth/register', data);
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  async loginWithMobile(mobile: string, password: string) {
    return this.client.post('/auth/login-mobile', { mobile, password });
  }

  async verifyOtp(userId: string, code: string, type: string) {
    return this.client.post('/auth/verify-otp', { userId, code, type });
  }

  async forgotPassword(email: string) {
    return this.client.post('/auth/forgot-password', { email });
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    return this.client.post('/auth/reset-password', { email, code, newPassword });
  }

  async refreshToken(refreshToken: string) {
    return this.client.post('/auth/refresh', { refreshToken });
  }

  // Customer endpoints
  async getProfile() {
    return this.client.get('/customers/profile');
  }

  async updateProfile(data: any) {
    return this.client.put('/customers/profile', data);
  }

  async changeEmail(newEmail: string) {
    return this.client.put('/customers/email', { newEmail });
  }

  async changePhone(newPhone: string) {
    return this.client.put('/customers/phone', { newPhone });
  }

  // Search endpoints
  async searchBusinesses(params: any) {
    return this.client.get('/search/businesses', { params });
  }

  async getBusinessProfile(businessId: string) {
    return this.client.get(`/search/businesses/${businessId}`);
  }

  // Booking endpoints
  async createBooking(data: any) {
    return this.client.post('/bookings', data);
  }

  async getBooking(bookingId: string) {
    return this.client.get(`/bookings/${bookingId}`);
  }

  async getBookings(filters?: any) {
    return this.client.get('/bookings', { params: filters });
  }

  // Payment endpoints
  async createPaymentIntent(bookingId: string) {
    return this.client.post('/payments/create-intent', { bookingId });
  }

  async getPaymentStatus(bookingId: string) {
    return this.client.get(`/payments/${bookingId}`);
  }

  // Review endpoints
  async submitReview(data: any) {
    return this.client.post('/reviews', data);
  }

  async getBusinessReviews(businessId: string, page = 1, limit = 10) {
    return this.client.get(`/businesses/${businessId}/reviews`, {
      params: { page, limit },
    });
  }
}

export const apiClient = new ApiClient();

// frontend/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '@/lib/api';
import create from 'zustand';

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  getProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    const { accessToken, refreshToken, user } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    set({ user, token: accessToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  register: async (data: any) => {
    await apiClient.register(data);
  },

  getProfile: async () => {
    const response = await apiClient.getProfile();
    set({ user: response.data.data });
  },

  updateProfile: async (data: any) => {
    await apiClient.updateProfile(data);
    await get().getProfile();
  },
}));

export const useAuth = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const store = useAuthStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');

      if (token && user) {
        useAuthStore.setState({
          token,
          user: JSON.parse(user),
          isAuthenticated: true,
        });
      }
      setIsLoaded(true);
    }
  }, []);

  return { ...store, isLoaded };
};

// frontend/hooks/useApi.ts
import { useState, useCallback } from 'react';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = (options?: UseApiOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(
    async (apiCall: Promise<any>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall;
        const result = response.data?.data || response.data;
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.response?.data?.error?.message || err.message || 'An error occurred';
        setError(errorMessage);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  return { loading, error, data, execute };
};

// frontend/hooks/useForm.ts
import { useState, useCallback } from 'react';

export const useForm = (initialValues: any, onSubmit: (values: any) => Promise<void>) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: any) => {
    const { name, value, type, checked } = e.target;
    setValues((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(
    async (e: any) => {
      e?.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err: any) {
        const newErrors: any = {};
        if (err.response?.data?.error?.details) {
          err.response.data.error.details.forEach((detail: any) => {
            newErrors[detail.field] = detail.message;
          });
        }
        setErrors(newErrors);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit],
  );

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev: any) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev: any) => ({ ...prev, [field]: error }));
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
  };
};

// frontend/contexts/AuthContext.tsx
import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

// frontend/types/index.ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  role: 'customer' | 'business' | 'admin';
}

export interface Business {
  id: string;
  name: string;
  description: string;
  suburb: string;
  postcode: string;
  state: string;
  avgRating: number;
  totalReviews: number;
  distance?: number;
  isVerified: boolean;
}

export interface Booking {
  id: string;
  businessId: string;
  status: string;
  appointmentDate: string;
  appointmentTime?: string;
  callOutFee: number;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
