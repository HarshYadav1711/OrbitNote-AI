import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { User } from "../types";

export function useAuth() {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: (user) => queryClient.setQueryData(["me"], user),
  });

  const signupMutation = useMutation({
    mutationFn: api.signup,
    onSuccess: (user) => queryClient.setQueryData(["me"], user as User),
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: async () => {
      queryClient.setQueryData(["me"], null);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return {
    user: meQuery.data,
    isLoading: meQuery.isLoading,
    isAuthenticated: Boolean(meQuery.data),
    loginMutation,
    signupMutation,
    logoutMutation,
  };
}
