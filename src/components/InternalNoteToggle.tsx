import { Lock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InternalNoteToggleProps {
  isInternalNote: boolean;
  onChange: (isInternal: boolean) => void;
}

export function InternalNoteToggle({ isInternalNote, onChange }: InternalNoteToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={isInternalNote ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onChange(!isInternalNote)}
            className={cn(
              'gap-2',
              isInternalNote && 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20'
            )}
          >
            {isInternalNote ? (
              <>
                <Lock className="h-4 w-4" />
                Nota Interna
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Mensagem
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isInternalNote
            ? 'Apenas agentes verão esta nota'
            : 'Cliente e agentes verão esta mensagem'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
