import { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { FileText, Check } from 'lucide-react';
import { messageTemplatesService, MessageTemplate } from '@/services/messageTemplates';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  onSelect: (template: MessageTemplate) => void;
  category?: string;
}

export function TemplateSelector({ onSelect, category }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, category]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await messageTemplatesService.list(category);
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (template: MessageTemplate) => {
    onSelect(template);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Templates
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar template..." />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Carregando...' : 'Nenhum template encontrado'}
            </CommandEmpty>
            <CommandGroup heading="Templates">
              {templates.map((template) => (
                <CommandItem
                  key={template.id}
                  onSelect={() => handleSelect(template)}
                  className="flex items-start gap-2"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{template.name}</p>
                      {template.shared && (
                        <span className="text-xs text-muted-foreground">(Compartilhado)</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.content}
                    </p>
                    {template.category && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {template.category}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
