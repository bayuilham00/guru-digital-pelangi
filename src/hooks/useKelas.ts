
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { Kelas } from "@/types/api";
import { toast } from "@/components/ui/use-toast";

export const useKelas = () => {
  return useQuery({
    queryKey: ['kelas'],
    queryFn: () => apiService.getKelas(),
  });
};

export const useCreateKelas = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (kelas: Omit<Kelas, 'id'>) => apiService.createKelas(kelas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: "Berhasil",
        description: "Kelas baru berhasil ditambahkan",
      });
    },
  });
};

export const useUpdateKelas = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...kelas }: { id: string } & Partial<Kelas>) => 
      apiService.updateKelas(id, kelas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas'] });
      toast({
        title: "Berhasil",
        description: "Data kelas berhasil diperbarui",
      });
    },
  });
};

export const useDeleteKelas = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteKelas(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: "Berhasil",
        description: "Kelas berhasil dihapus",
      });
    },
  });
};
