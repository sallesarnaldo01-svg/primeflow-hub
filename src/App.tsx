import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingSplash } from "@/components/LoadingSplash";
import { useAuthStore } from "@/stores/auth";
import { useEffect, useState } from "react";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Atendimentos from "./pages/Atendimentos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

const App = () => {
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSplash />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public routes */}
                <Route 
                  path="/login" 
                  element={
                    isAuthenticated ? (
                      <Navigate to="/" replace />
                    ) : (
                      <Login />
                    )
                  } 
                />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/crm"
                  element={
                    <ProtectedRoute>
                      <CRM />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/funil"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Funil de Vendas</h1>
                        <p className="text-muted-foreground mt-2">
                          Analytics e métricas do pipeline de vendas em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/atendimentos"
                  element={
                    <ProtectedRoute>
                      <Atendimentos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agendamentos"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Agendamentos</h1>
                        <p className="text-muted-foreground mt-2">
                          Calendário e gestão de reuniões em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chamadas"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Chamadas</h1>
                        <p className="text-muted-foreground mt-2">
                          Central de vídeo/áudio em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tickets"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Tickets</h1>
                        <p className="text-muted-foreground mt-2">
                          Sistema de suporte em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/deals"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Deals</h1>
                        <p className="text-muted-foreground mt-2">
                          Gestão de oportunidades em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/empresas"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Empresas</h1>
                        <p className="text-muted-foreground mt-2">
                          Base de empresas em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tags"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Tags</h1>
                        <p className="text-muted-foreground mt-2">
                          Gestão de etiquetas em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflows"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Workflows</h1>
                        <p className="text-muted-foreground mt-2">
                          Automações em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/integracoes"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Integrações</h1>
                        <p className="text-muted-foreground mt-2">
                          Conectores e APIs em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Inteligência Artificial</h1>
                        <p className="text-muted-foreground mt-2">
                          Recursos de IA em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/financeiro"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Financeiro</h1>
                        <p className="text-muted-foreground mt-2">
                          Relatórios financeiros em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/config"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Configurações</h1>
                        <p className="text-muted-foreground mt-2">
                          Painel de configurações em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />

                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
