import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUIStore } from '@/stores/ui';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  Ticket,
  Building2,
  BarChart3,
  UserCheck,
  Settings,
  DollarSign,
  Palette,
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Link as LinkIcon,
  Columns3,
  GitBranch,
  ChevronUp,
  Phone,
  Tag,
  Workflow,
  Sparkles,
  Plug,
  Contact,
  Home,
  ShoppingBag,
  List,
  Facebook,
  Megaphone,
} from 'lucide-react';
import logo from '@/assets/logo.svg';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', badge: null },
  { icon: MessageCircle, label: 'Conversas', href: '/conversas', badge: 12 },
  {
    icon: LinkIcon,
    label: 'Conexões',
    href: '/conexoes',
    badge: null,
    hasDropdown: true,
    subItems: [
      { label: 'WhatsApp', href: '/conexoes/whatsapp' },
      { label: 'Facebook', href: '/conexoes/facebook' },
      { label: 'Instagram', href: '/conexoes/instagram' },
    ]
  },
  { icon: Contact, label: 'Contatos', href: '/contatos', badge: null },
  { icon: List, label: 'Listas de Contatos', href: '/listas-contatos', badge: null },
  { icon: Users, label: 'CRM', href: '/crm', badge: null },
  { icon: Home, label: 'Imóveis', href: '/imoveis', badge: null },
  { icon: ShoppingBag, label: 'Produtos', href: '/produtos', badge: null },
  {
    icon: GitBranch,
    label: 'Scrum',
    href: '/scrum',
    badge: null,
    hasDropdown: true,
    subItems: [
      { label: 'Backlog', href: '/scrum/backlog' },
      { label: 'Planejamento', href: '/scrum/planejamento' },
      { label: 'Quadro Scrum', href: '/scrum/quadro' },
      { label: 'Relatórios', href: '/scrum/relatorios' },
    ]
  },
  { icon: Calendar, label: 'Agendamentos', href: '/agendamentos', badge: null },
  { icon: Phone, label: 'Chamadas', href: '/chamadas', badge: null },
  { icon: Ticket, label: 'Tickets', href: '/tickets', badge: 8 },
  { icon: Building2, label: 'Empresas', href: '/empresas', badge: null },
  { icon: Tag, label: 'Tags', href: '/tags', badge: null },
  { icon: Workflow, label: 'Workflows', href: '/workflows', badge: null },
  {
    icon: Megaphone,
    label: 'Marketing',
    href: '/marketing',
    badge: null,
    hasDropdown: true,
    subItems: [
      { label: 'Campanhas Facebook', href: '/campanhas-facebook' },
    ]
  },
  {
    icon: Sparkles,
    label: 'IA',
    href: '/ia',
    badge: 'NOVO',
    hasDropdown: true,
    subItems: [
      { label: 'Agentes de IA', href: '/ia' },
      { label: 'AI Tools', href: '/ia/tools' },
      { label: 'Base de Conhecimento', href: '/ia/knowledge' },
      { label: 'Follow-up / Cadências', href: '/ia/followup' },
      { label: 'Performance de IA', href: '/ia/performance' },
    ]
  },
  { icon: Plug, label: 'Integrações', href: '/integracoes', badge: null },
  { icon: BarChart3, label: 'Relatórios & Analytics', href: '/relatorios', badge: null },
  { icon: UserCheck, label: 'Usuários & Times', href: '/usuarios', badge: null },
  { icon: DollarSign, label: 'Financeiro', href: '/financeiro', badge: null, adminOnly: true },
  { icon: DollarSign, label: 'Comissões', href: '/comissoes', badge: null },
  { icon: Settings, label: 'Configurações', href: '/configuracoes', badge: null },
  { icon: Palette, label: 'Personalização', href: '/personalizacao', badge: null, adminOnly: true },
  { icon: HelpCircle, label: 'Ajuda / Sobre', href: '/ajuda', badge: null },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isDropdownOpen = (label: string) => openDropdowns.includes(label);

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
        initial={false}
        animate={{ 
          width: sidebarCollapsed ? 80 : 280
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card border-r flex-shrink-0",
          sidebarCollapsed ? "w-20" : "w-70",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hasDropdown = item.hasDropdown && !sidebarCollapsed;
              const dropdownOpen = isDropdownOpen(item.label);
              
              if (hasDropdown) {
                return (
                  <Collapsible key={item.label} open={dropdownOpen} onOpenChange={() => toggleDropdown(item.label)}>
                    <CollapsibleTrigger asChild>
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
                                className="ml-auto mr-2"
                              >
                                {item.badge}
                              </Badge>
                            )}
                            {dropdownOpen ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-1">
                      {item.subItems?.map((subItem) => (
                        <Link key={subItem.href} to={subItem.href}>
                          <Button
                            variant={isActive(subItem.href) ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start ml-6",
                              isActive(subItem.href) && "bg-primary/10 text-primary hover:bg-primary/20"
                            )}
                          >
                            <span className="text-sm">{subItem.label}</span>
                          </Button>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
              
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