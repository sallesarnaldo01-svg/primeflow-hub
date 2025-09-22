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
import Conversas from "./pages/Conversas";
import Conexoes from "./pages/Conexoes";
import FunilVendas from "./pages/FunilVendas";
import Kanban from "./pages/Kanban";
import Scrum from "./pages/Scrum";
import Agendamentos from "./pages/Agendamentos";
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
                  path="/conversas"
                  element={
                    <ProtectedRoute>
                      <Conversas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/conexoes/*"
                  element={
                    <ProtectedRoute>
                      <Conexoes />
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
                      <FunilVendas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kanban"
                  element={
                    <ProtectedRoute>
                      <Kanban />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scrum/*"
                  element={
                    <ProtectedRoute>
                      <Scrum />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agendamentos"
                  element={
                    <ProtectedRoute>
                      <Agendamentos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/relatorios"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Relatórios & Analytics</h1>
                        <p className="text-muted-foreground mt-2">
                          Dashboards analíticos e relatórios em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/usuarios"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Usuários & Times</h1>
                        <p className="text-muted-foreground mt-2">
                          Controle de acesso e gestão de equipes em desenvolvimento...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracoes"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Configurações</h1>
                        <p className="text-muted-foreground mt-2">
                          Opções de configuração do sistema em desenvolvimento...
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
                          Planos, faturas e pagamentos (Admin Supremo apenas)...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/personalizacao"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Personalização</h1>
                        <p className="text-muted-foreground mt-2">
                          Customização de marca e layout (Admin Supremo apenas)...
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ajuda"
                  element={
                    <ProtectedRoute>
                      <div className="p-6">
                        <h1 className="text-3xl font-bold">Ajuda / Sobre</h1>
                        <p className="text-muted-foreground mt-2">
                          Documentação, suporte e informações do sistema...
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
