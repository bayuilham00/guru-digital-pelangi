
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => apiService.getRecentActivity(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
