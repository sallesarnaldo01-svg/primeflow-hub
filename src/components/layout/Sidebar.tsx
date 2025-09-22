import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/ui';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  Phone,
  Building2,
  TrendingUp,
  Ticket,
  Handshake,
  Tags,
  Workflow,
  Zap,
  Bot,
  DollarSign,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import logo from '@/assets/logo.svg';

const menuItems = [
  {
    title: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/', badge: null },
      { icon: Users, label: 'CRM/Kanban', href: '/crm', badge: null },
      { icon: TrendingUp, label: 'Funil de Vendas', href: '/funil', badge: null },
    ]
  },
  {
    title: 'Comunicação',
    items: [
      { icon: MessageSquare, label: 'Atendimentos', href: '/atendimentos', badge: 12 },
      { icon: Calendar, label: 'Agendamentos', href: '/agendamentos', badge: null },
      { icon: Phone, label: 'Chamadas', href: '/chamadas', badge: null },
    ]
  },
  {
    title: 'Gestão',
    items: [
      { icon: Ticket, label: 'Tickets', href: '/tickets', badge: 5 },
      { icon: Handshake, label: 'Deals', href: '/deals', badge: null },
      { icon: Building2, label: 'Empresas', href: '/empresas', badge: null },
      { icon: Tags, label: 'Tags', href: '/tags', badge: null },
    ]
  },
  {
    title: 'Automação',
    items: [
      { icon: Workflow, label: 'Workflows', href: '/workflows', badge: null },
      { icon: Zap, label: 'Integrações', href: '/integracoes', badge: null },
      { icon: Bot, label: 'AI', href: '/ai', badge: 'NOVO' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { icon: DollarSign, label: 'Financeiro', href: '/financeiro', badge: null },
      { icon: Settings, label: 'Configurações', href: '/config', badge: null },
    ]
  },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ 
          x: sidebarOpen || window.innerWidth >= 768 ? 0 : -280,
          width: sidebarCollapsed ? 80 : 280
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card border-r",
          "md:relative md:translate-x-0",
          sidebarCollapsed ? "w-20" : "w-70"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {!sidebarCollapsed && (
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <img src={logo} alt="PrimeZapAI" className="h-8 w-8" />
                <div>
                  <h1 className="text-lg font-bold gradient-primary bg-clip-text text-transparent">
                    PrimeZapAI
                  </h1>
                  <p className="text-xs text-muted-foreground">CRM & Omnichannel</p>
                </div>
              </motion.div>
            )}
            
            <div className="flex items-center space-x-1">
              {/* Collapse button for desktop */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
              
              {/* Close button for mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {menuItems.map((section) => (
              <div key={section.title}>
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link key={item.href} to={item.href}>
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            sidebarCollapsed ? "px-2" : "px-3",
                            active && "bg-primary/10 text-primary hover:bg-primary/20"
                          )}
                        >
                          <Icon className={cn("h-4 w-4", !sidebarCollapsed && "mr-2")} />
                          {!sidebarCollapsed && (
                            <>
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.badge && (
                                <Badge 
                                  variant={typeof item.badge === 'string' ? 'secondary' : 'destructive'}
                                  className="ml-auto"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
                {section !== menuItems[menuItems.length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          {!sidebarCollapsed && (
            <motion.div 
              className="p-4 border-t bg-muted/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-xs text-muted-foreground">
                <p>© 2024 PrimeZapAI</p>
                <p>Versão 2.1.0</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </>
  );
}