import { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Play,
  Save,
  Upload,
  Download,
  Trash2,
  Plus,
  Zap,
  MessageSquare,
  Clock,
  GitBranch,
  Settings,
} from 'lucide-react';
import { Workflow, WorkflowNode } from '@/types/workflow';

interface WorkflowBuilderProps {
  workflow: Workflow | null;
  onSave: (workflow: Workflow) => void;
  onValidate: (workflow: Workflow) => Promise<{ valid: boolean; errors: any[] }>;
  onPublish: (workflow: Workflow) => void;
}

export function WorkflowBuilder({ workflow, onSave, onValidate, onPublish }: WorkflowBuilderProps) {
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow?.nodes || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  const handleAddNode = useCallback((type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 100, y: nodes.length * 100 },
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      },
    };
    setNodes([...nodes, newNode]);
  }, [nodes]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  }, [nodes, selectedNode]);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      toast.error('Nome do workflow é obrigatório');
      return;
    }

    const updatedWorkflow: Workflow = {
      ...(workflow || {}),
      id: workflow?.id || `workflow-${Date.now()}`,
      name,
      description,
      status: workflow?.status || 'draft',
      version: (workflow?.version || 0) + 1,
      nodes,
      edges: workflow?.edges || [],
      createdAt: workflow?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedWorkflow);
    toast.success('Workflow salvo como rascunho');
  }, [workflow, name, description, nodes, onSave]);

  const handleValidate = useCallback(async () => {
    if (!workflow) return;

    const result = await onValidate({
      ...workflow,
      nodes,
    });

    setValidationErrors(result.errors);

    if (result.valid) {
      toast.success('Workflow válido!');
    } else {
      toast.error(`${result.errors.length} erro(s) encontrado(s)`);
    }
  }, [workflow, nodes, onValidate]);

  const handlePublish = useCallback(async () => {
    if (!workflow) return;

    const result = await onValidate({
      ...workflow,
      nodes,
    });

    if (!result.valid) {
      toast.error('Corrija os erros antes de publicar');
      setValidationErrors(result.errors);
      return;
    }

    onPublish({
      ...workflow,
      nodes,
      status: 'active',
    });

    toast.success('Workflow publicado com sucesso!');
  }, [workflow, nodes, onValidate, onPublish]);

  const handleExport = useCallback(() => {
    if (!workflow) return;

    const data = JSON.stringify(workflow, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${workflow.name}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Workflow exportado');
  }, [workflow]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Workflow Builder</CardTitle>
              <CardDescription>
                Configure o fluxo de atendimento com IA
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={handleValidate}>
                <Settings className="w-4 h-4 mr-2" />
                Validar
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button size="sm" onClick={handlePublish}>
                <Play className="w-4 h-4 mr-2" />
                Publicar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome do Workflow</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Atendimento WhatsApp VIP"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Badge variant={workflow?.status === 'active' ? 'default' : 'secondary'}>
                {workflow?.status || 'draft'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo deste workflow"
            />
          </div>

          {validationErrors.length > 0 && (
            <div className="rounded-md bg-destructive/10 p-4">
              <h4 className="font-semibold text-destructive mb-2">Erros de Validação:</h4>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-destructive">
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nós</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => handleAddNode('trigger')}>
              <Zap className="w-4 h-4 mr-2" />
              Gatilho
            </Button>
            <Button variant="outline" onClick={() => handleAddNode('action')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Ação
            </Button>
            <Button variant="outline" onClick={() => handleAddNode('condition')}>
              <GitBranch className="w-4 h-4 mr-2" />
              Condição
            </Button>
            <Button variant="outline" onClick={() => handleAddNode('delay')}>
              <Clock className="w-4 h-4 mr-2" />
              Delay
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card>
        <CardHeader>
          <CardTitle>Canvas do Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] border-2 border-dashed rounded-lg p-4">
            {nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <Plus className="w-12 h-12 mb-4" />
                <p>Adicione nós para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedNode(node.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {node.type}
                        </Badge>
                        <h4 className="font-medium">{node.data.label}</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simulator */}
      <Card>
        <CardHeader>
          <CardTitle>Simulador</CardTitle>
          <CardDescription>
            Teste o workflow com mensagens de exemplo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input placeholder="Digite uma mensagem de teste..." />
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Simular
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
