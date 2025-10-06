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
// Lazy-loaded pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CRM = lazy(() => import("./pages/CRM"));
const Leads = lazy(() => import("./pages/Leads"));
const ListasContatos = lazy(() => import("./pages/ListasContatos"));
const CampanhasFacebook = lazy(() => import("./pages/CampanhasFacebook"));
const Kanban = lazy(() => import("./pages/Kanban"));
const Agendamentos = lazy(() => import("./pages/Agendamentos"));
const Conversas = lazy(() => import("./pages/Conversas"));
const FunilVendas = lazy(() => import("./pages/FunilVendas"));
const Chamadas = lazy(() => import("./pages/Chamadas"));
const Tickets = lazy(() => import("./pages/Tickets"));
const Empresas = lazy(() => import("./pages/Empresas"));
const Tags = lazy(() => import("./pages/Tags"));
const Workflows = lazy(() => import("./pages/Workflows"));
const IA = lazy(() => import("./pages/IA"));
const AIProviders = lazy(() => import("./pages/AIProviders"));
const AITools = lazy(() => import("./pages/AITools"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const IAPerformance = lazy(() => import("./pages/IAPerformance"));
const FollowUp = lazy(() => import("./pages/FollowUp"));
const Produtos = lazy(() => import("./pages/Produtos"));
const CamposCustomizados = lazy(() => import("./pages/CamposCustomizados"));
const Integracoes = lazy(() => import("./pages/Integracoes"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const ConfiguracoesAvancadas = lazy(() => import("./pages/ConfiguracoesAvancadas"));
const Relatorios = lazy(() => import("./pages/Relatórios"));
const Usuarios = lazy(() => import("./pages/Usuarios"));

// Static pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
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
                  path="/chamadas"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Chamadas />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tickets"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Tickets />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/empresas"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Empresas />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tags"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Tags />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflows"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Workflows />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ia"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <IA />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ia/providers"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <AIProviders />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ia/tools"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <AITools />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ia/knowledge"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <KnowledgeBase />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ia/followup"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <FollowUp />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ia/performance"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <IAPerformance />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/produtos"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Produtos />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campos-customizados"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <CamposCustomizados />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/integracoes"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Integracoes />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/financeiro"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Financeiro />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracoes"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <ConfiguracoesAvancadas />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/relatorios"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Relatorios />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/usuarios"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        <Usuarios />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/contatos"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}>
                        {(() => {
                          const Contatos = lazy(() => import("./pages/Contatos"));
                          return <Contatos />;
                        })()}
                      </Suspense>
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

                {/* CRM */}
                <Route
                  path="/crm/leads"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}
                      >
                        <Leads />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/crm/listas"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}
                      >
                        <ListasContatos />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/crm/campanhas-facebook"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<PageSkeleton />}
                      >
                        <CampanhasFacebook />
                      </Suspense>
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
