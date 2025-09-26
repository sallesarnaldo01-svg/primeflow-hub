import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingSplash } from "@/components/LoadingSplash";
import { CommandPalette, useCommandPalette } from "@/components/CommandPalette";
import { useAuthStore } from "@/stores/auth";
import { useEffect, useState, Suspense, lazy } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";

// Lazy-loaded pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Kanban = lazy(() => import("./pages/Kanban"));
const Agendamentos = lazy(() => import("./pages/Agendamentos"));
const Conversas = lazy(() => import("./pages/Conversas"));
const FunilVendas = lazy(() => import("./pages/FunilVendas"));

// Static pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CRM from "./pages/CRM";
import Conexoes from "./pages/Conexoes";
import Scrum from "./pages/Scrum";
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
  const { open, setOpen } = useCommandPalette();

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
          <CommandPalette open={open} onOpenChange={setOpen} />
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
                <Route 
                  path="/register" 
                  element={
                    isAuthenticated ? (
                      <Navigate to="/" replace />
                    ) : (
                      <Register />
                    )
                  } 
                />
                <Route 
                  path="/reset-password" 
                  element={
                    isAuthenticated ? (
                      <Navigate to="/" replace />
                    ) : (
                      <ResetPassword />
                    )
                  } 
                />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Dashboard />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/conversas"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Conversas />
                      </Suspense>
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
                      <Suspense fallback={<PageSkeleton />}>
                        <FunilVendas />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kanban"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Kanban />
                      </Suspense>
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
                      <Suspense fallback={<PageSkeleton />}>
                        <Agendamentos />
                      </Suspense>
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
