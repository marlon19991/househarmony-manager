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
import { useInitializeApp } from "./hooks/useInitializeApp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const AppRoutes = () => {
  useInitializeApp();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/general-cleaning" element={<GeneralCleaning />} />
        <Route path="/recurring-tasks" element={<RecurringTasks />} />
        <Route path="/bills" element={<Bills />} />
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
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </React.StrictMode>
    </QueryClientProvider>
  );
};

export default App;