import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  MessageCircle,
  BarChart3,
  Users,
  Phone,
  FileText,
  Plus,
  Search,
} from 'lucide-react';

const commands = [
  {
    group: 'Navegação',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/' },
      { id: 'conversas', label: 'Conversas', icon: MessageCircle, path: '/conversas' },
      { id: 'crm', label: 'CRM', icon: Users, path: '/crm' },
      { id: 'funil', label: 'Funil de Vendas', icon: BarChart3, path: '/funil' },
      { id: 'kanban', label: 'Kanban', icon: FileText, path: '/kanban' },
      { id: 'scrum', label: 'Scrum', icon: FileText, path: '/scrum' },
      { id: 'agendamentos', label: 'Agendamentos', icon: Calendar, path: '/agendamentos' },
      { id: 'conexoes', label: 'Conexões', icon: Phone, path: '/conexoes' },
    ],
  },
  {
    group: 'Ações Rápidas',
    items: [
      { id: 'new-contact', label: 'Novo Contato', icon: User, action: 'new-contact' },
      { id: 'new-deal', label: 'Nova Oportunidade', icon: CreditCard, action: 'new-deal' },
      { id: 'new-task', label: 'Nova Tarefa', icon: Plus, action: 'new-task' },
      { id: 'new-appointment', label: 'Novo Agendamento', icon: Calendar, action: 'new-appointment' },
    ],
  },
  {
    group: 'Configurações',
    items: [
      { id: 'settings', label: 'Configurações', icon: Settings, path: '/configuracoes' },
      { id: 'profile', label: 'Perfil', icon: User, action: 'profile' },
      { id: 'help', label: 'Ajuda', icon: Smile, path: '/ajuda' },
    ],
  },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  const handleSelect = (value: string) => {
    const command = commands
      .flatMap(group => group.items)
      .find(item => item.id === value);
    
    if (command) {
      if (command.path) {
        navigate(command.path);
      } else if (command.action) {
        // Handle actions here
        console.log('Action:', command.action);
        switch (command.action) {
          case 'new-contact':
            // Open new contact modal/form
            break;
          case 'new-deal':
            // Open new deal modal/form
            break;
          case 'new-task':
            // Open new task modal/form
            break;
          case 'new-appointment':
            // Open new appointment modal/form
            break;
          case 'profile':
            // Open profile settings
            break;
        }
      }
    }
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Digite um comando ou pesquise..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        {commands.map((group) => (
          <div key={group.group}>
            <CommandGroup heading={group.group}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={handleSelect}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

// Hook to use the command palette globally
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
}