import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { User } from "../types";

export function useAuth() {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 60_000,
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
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
    },
  });

  return {
    user: meQuery.data ?? undefined,
    isLoading: meQuery.isPending,
    isAuthenticated: Boolean(meQuery.data),
    sessionError: meQuery.isError
      ? meQuery.error instanceof Error
        ? meQuery.error.message
        : "Could not verify session"
      : null,
    loginMutation,
    signupMutation,
    logoutMutation,
  };
}
