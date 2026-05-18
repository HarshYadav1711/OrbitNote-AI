import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement, type ReactNode } from "react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";

type Options = RenderOptions & {
  router?: MemoryRouterProps;
};

export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const { router, ...renderOptions } = options;
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter {...router}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
