import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * React Query Hooks for Chef Data
 * 
 * Benefits:
 * - Automatic caching and background refetching
 * - Optimistic updates
 * - Automatic retries
 * - Loading and error states
 * - Cache invalidation
 */

// ===== Query Keys =====
export const chefKeys = {
  all: ['chefs'],
  lists: () => [...chefKeys.all, 'list'],
  list: (filters) => [...chefKeys.lists(), filters],
  details: () => [...chefKeys.all, 'detail'],
  detail: (id) => [...chefKeys.details(), id],
  search: (query) => [...chefKeys.all, 'search', query],
};

// ===== Fetch Functions =====
const fetchAllChefs = async () => {
  const { data } = await axios.get(`${API_URL}/chefs`);
  return data.chefs || data;
};

const fetchChefById = async (id) => {
  const { data } = await axios.get(`${API_URL}/chefs/${id}`);
  return data;
};

const searchChefs = async (searchParams) => {
  const { data } = await axios.get(`${API_URL}/chefs/search`, { params: searchParams });
  return data;
};

// ===== Query Hooks =====

/**
 * Hook to fetch all active chefs
 * @returns {Object} React Query result with chefs data
 */
export const useAllChefs = () => {
  return useQuery({
    queryKey: chefKeys.lists(),
    queryFn: fetchAllChefs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single chef by ID
 * @param {string} id - Chef ID
 * @param {Object} options - React Query options
 * @returns {Object} React Query result with chef data
 */
export const useChef = (id, options = {}) => {
  return useQuery({
    queryKey: chefKeys.detail(id),
    queryFn: () => fetchChefById(id),
    enabled: !!id, // Only run if ID exists
    staleTime: 10 * 60 * 1000, // 10 minutes (individual chefs change less frequently)
    ...options,
  });
};

/**
 * Hook to search chefs with filters
 * @param {Object} searchParams - Search parameters
 * @param {Object} options - React Query options
 * @returns {Object} React Query result with search results
 */
export const useSearchChefs = (searchParams, options = {}) => {
  return useQuery({
    queryKey: chefKeys.search(searchParams),
    queryFn: () => searchChefs(searchParams),
    enabled: options.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes (search results can change quickly)
    ...options,
  });
};

// ===== Mutation Hooks =====

/**
 * Hook to toggle favorite chef
 * @returns {Object} React Query mutation
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chefId, isFavorite }) => {
      const token = localStorage.getItem('authToken');
      const endpoint = isFavorite ? 'remove' : 'add';
      const { data } = await axios.post(
        `${API_URL}/users/favorites/${endpoint}`,
        { chefId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate chef lists to refetch with updated favorite status
      queryClient.invalidateQueries({ queryKey: chefKeys.lists() });
      queryClient.invalidateQueries({ queryKey: chefKeys.detail(variables.chefId) });
    },
  });
};

/**
 * Hook to create chef profile
 * @returns {Object} React Query mutation
 */
export const useCreateChef = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chefData) => {
      const { data } = await axios.post(`${API_URL}/chefs`, chefData);
      return data;
    },
    onSuccess: () => {
      // Invalidate chef lists to include new chef
      queryClient.invalidateQueries({ queryKey: chefKeys.lists() });
    },
  });
};

/**
 * Hook to update chef profile
 * @returns {Object} React Query mutation
 */
export const useUpdateChef = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, chefData }) => {
      const { data } = await axios.put(`${API_URL}/chefs/${id}`, chefData);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific chef and lists
      queryClient.invalidateQueries({ queryKey: chefKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: chefKeys.lists() });
    },
  });
};
