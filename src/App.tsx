import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import GeneralCleaning from "./pages/GeneralCleaning";
import Bills from "./pages/Bills";
import RecurringTasks from "./pages/RecurringTasks";
import Inventory from "./pages/Inventory";
import Pricing from "./pages/Pricing";
import { useInitializeProfiles } from "./hooks/useProfiles";
import ErrorBoundary from "./components/ErrorBoundary";

// Configuración de React Query según mejores prácticas
// https://tanstack.com/query/latest/docs/react/guides/important-defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - datos considerados frescos
      gcTime: 10 * 60 * 1000, // 10 minutes - tiempo de cache (antes cacheTime)
      retry: 1, // Reintentar una vez en caso de error
      refetchOnWindowFocus: false, // No refetch al cambiar de pestaña
      refetchOnReconnect: true, // Refetch al reconectar
      refetchOnMount: true, // Refetch al montar el componente
    },
    mutations: {
      retry: 1, // Reintentar mutaciones una vez en caso de error
      onError: (error) => {
        console.error('Error en mutación:', error);
      },
    },
  },
});

const AppRoutes = () => {
  useInitializeProfiles();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/general-cleaning" element={<GeneralCleaning />} />
        <Route path="/recurring-tasks" element={<RecurringTasks />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <React.StrictMode>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </React.StrictMode>
    </QueryClientProvider>
  );
};

export default App;
