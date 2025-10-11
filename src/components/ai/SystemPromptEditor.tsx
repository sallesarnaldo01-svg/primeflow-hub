import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SystemPromptEditorProps {
  agentId: string;
  initialPrompt?: string;
  onSave: (prompt: string) => Promise<void>;
}

export function SystemPromptEditor({ agentId, initialPrompt, onSave }: SystemPromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!prompt.trim()) {
      toast.error("O prompt não pode estar vazio");
      return;
    }

    if (prompt.trim().length < 50) {
      toast.error("O prompt deve ter pelo menos 50 caracteres");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(prompt);
      toast.success("Prompt salvo com sucesso!", {
        description: "A persona do agente foi atualizada.",
      });
    } catch (error) {
      toast.error("Erro ao salvar", {
        description: "Não foi possível atualizar o prompt do sistema.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const templateVendas = `Você é um assistente de vendas profissional e consultivo. Seu objetivo é:

1. Qualificar leads através de perguntas abertas sobre suas necessidades
2. Apresentar soluções personalizadas baseadas no perfil do cliente
3. Agendar demonstrações e reuniões quando apropriado
4. Manter um tom cordial, empático e consultivo

Diretrizes:
- Sempre cumprimente o cliente de forma calorosa
- Faça perguntas para entender o contexto antes de oferecer soluções
- Use linguagem profissional mas acessível
- Seja proativo em agendar próximos passos
- Registre informações importantes sobre o cliente`;

  const templateSuporte = `Você é um atendente de suporte técnico especializado. Seu objetivo é:

1. Resolver problemas técnicos de forma rápida e eficiente
2. Guiar clientes através de procedimentos passo a passo
3. Escalar casos complexos quando necessário
4. Documentar soluções para referência futura

Diretrizes:
- Demonstre empatia com a frustração do cliente
- Seja claro e objetivo nas instruções
- Use linguagem simples, evitando jargões técnicos
- Confirme que o problema foi resolvido antes de finalizar
- Ofereça recursos adicionais quando relevante`;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="system-prompt" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Prompt de Sistema (Persona do Agente)
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Defina a personalidade, regras e prioridades do seu Agente de IA.
          Este será o guia principal para todas as interações.
        </p>
      </div>

      <Textarea
        id="system-prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Exemplo: Você é um assistente profissional de vendas. Seu objetivo é qualificar leads, responder dúvidas sobre produtos e agendar horários. Seja educado, objetivo e sempre busque entender a necessidade do cliente antes de oferecer soluções..."
        className="min-h-[300px] font-mono text-sm"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {prompt.length} caracteres | ~{Math.ceil(prompt.length / 4)} tokens
        </p>
        <Button onClick={handleSave} disabled={isSaving || !prompt.trim()}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar Prompt"}
        </Button>
      </div>

      {/* Templates sugeridos */}
      <div className="border-t pt-4">
        <Label className="text-xs">Templates Sugeridos:</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPrompt(templateVendas)}
          >
            Vendas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPrompt(templateSuporte)}
          >
            Suporte
          </Button>
        </div>
      </div>
    </div>
  );
}
