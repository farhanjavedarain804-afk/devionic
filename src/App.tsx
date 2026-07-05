import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import PublicApp from "@/apps/public/PublicApp";
import ConsoleApp from "@/apps/console/ConsoleApp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
    },
  },
});

const App = () => {
  const hostname = window.location.hostname;
  const isConsoleDomain = hostname.startsWith("console.") || hostname.startsWith("admin.") || window.location.pathname.startsWith("/dms/admin");

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {isConsoleDomain ? <ConsoleApp /> : <PublicApp />}
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
