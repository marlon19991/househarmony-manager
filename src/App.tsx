import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Profiles from "./pages/Profiles";
import GeneralCleaning from "./pages/GeneralCleaning";
import Tasks from "./pages/Tasks";
import Bills from "./pages/Bills";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profiles" element={<Profiles />} />
              <Route path="/general-cleaning" element={<GeneralCleaning />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/bills" element={<Bills />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;