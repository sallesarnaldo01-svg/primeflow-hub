import { useCallback, useState, useEffect } from 'react';
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
  Mail,
  Tag,
  Database,
} from 'lucide-react';
import { Workflow, WorkflowNode } from '@/types/workflow';
import WorkflowCanvas from '@/components/workflows/WorkflowCanvas';
import { Node, Edge } from 'react-flow-renderer';

interface WorkflowBuilderProps {
  workflow: Workflow | null;
  onSave: (workflow: Workflow) => void;
  onValidate: (workflow: Workflow) => Promise<{ valid: boolean; errors: any[] }>;
  onPublish: (workflow: Workflow) => void;
}

export function WorkflowBuilder({ workflow, onSave, onValidate, onPublish }: WorkflowBuilderProps) {
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  useEffect(() => {
    if (workflow?.nodes) {
      const flowNodes: Node[] = (workflow.nodes as any[]).map((node, index) => ({
        id: node.id || `node-${index}`,
        type: node.type || 'action',
        position: node.position || { x: 100, y: 100 + (index * 150) },
        data: {
          label: node.data?.label || `${node.type} Node`,
          ...node.data
        }
      }));
      setNodes(flowNodes);
    }
    
    if (workflow?.edges) {
      setEdges(workflow.edges as Edge[]);
    }
  }, [workflow]);

  const handleAddNode = useCallback((type: 'trigger' | 'action' | 'condition' | 'delay') => {
    const nodeLabels = {
      trigger: 'Gatilho',
      action: 'Ação',
      condition: 'Condição',
      delay: 'Espera'
    };

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: { 
        x: 250 + Math.random() * 200, 
        y: 100 + nodes.length * 100 
      },
      data: {
        label: nodeLabels[type],
        type: type,
      },
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    toast.success(`Nó ${nodeLabels[type]} adicionado`);
  }, [nodes]);

  const handleNodesChange = useCallback((updatedNodes: Node[]) => {
    setNodes(updatedNodes);
  }, []);

  const handleEdgesChange = useCallback((updatedEdges: Edge[]) => {
    setEdges(updatedEdges);
  }, []);

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
      nodes: nodes as any,
      edges: edges as any,
      createdAt: workflow?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedWorkflow);
    toast.success('Workflow salvo como rascunho');
  }, [workflow, name, description, nodes, edges, onSave]);

  const handleValidate = useCallback(async () => {
    if (!workflow) return;

    const result = await onValidate({
      ...workflow,
      nodes: nodes as any,
      edges: edges as any,
    });

    setValidationErrors(result.errors);

    if (result.valid) {
      toast.success('Workflow válido!');
    } else {
      toast.error(`${result.errors.length} erro(s) encontrado(s)`);
    }
  }, [workflow, nodes, edges, onValidate]);

  const handlePublish = useCallback(async () => {
    if (!workflow) return;

    const result = await onValidate({
      ...workflow,
      nodes: nodes as any,
      edges: edges as any,
    });

    if (!result.valid) {
      toast.error('Corrija os erros antes de publicar');
      setValidationErrors(result.errors);
      return;
    }

    onPublish({
      ...workflow,
      nodes: nodes as any,
      edges: edges as any,
      status: 'active',
    });

    toast.success('Workflow publicado com sucesso!');
  }, [workflow, nodes, edges, onValidate, onPublish]);

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
          <CardTitle className="flex items-center justify-between">
            <span>Ferramentas</span>
            <Badge variant="secondary">{nodes.length} nós</Badge>
          </CardTitle>
          <CardDescription>
            Arraste os nós para o canvas e conecte-os para criar o fluxo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleAddNode('trigger')}
              className="h-auto flex-col py-3"
            >
              <Zap className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs">Gatilho</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAddNode('action')}
              className="h-auto flex-col py-3"
            >
              <MessageSquare className="w-5 h-5 mb-1 text-green-600" />
              <span className="text-xs">Enviar Mensagem</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAddNode('condition')}
              className="h-auto flex-col py-3"
            >
              <GitBranch className="w-5 h-5 mb-1 text-yellow-600" />
              <span className="text-xs">Condição</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAddNode('delay')}
              className="h-auto flex-col py-3"
            >
              <Clock className="w-5 h-5 mb-1 text-purple-600" />
              <span className="text-xs">Aguardar</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAddNode('action')}
              className="h-auto flex-col py-3"
            >
              <Mail className="w-5 h-5 mb-1 text-orange-600" />
              <span className="text-xs">Enviar Email</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAddNode('action')}
              className="h-auto flex-col py-3"
            >
              <Tag className="w-5 h-5 mb-1 text-pink-600" />
              <span className="text-xs">Adicionar Tag</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAddNode('action')}
              className="h-auto flex-col py-3"
            >
              <Database className="w-5 h-5 mb-1 text-cyan-600" />
              <span className="text-xs">Atualizar Campo</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAddNode('action')}
              className="h-auto flex-col py-3"
            >
              <Settings className="w-5 h-5 mb-1 text-gray-600" />
              <span className="text-xs">Outro</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Canvas Visual - Arraste e Solte</span>
            <div className="flex gap-2 text-xs text-muted-foreground items-center">
              <span>💡 Arraste nós, conecte-os e crie seu fluxo</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {nodes.length === 0 ? (
            <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg m-6 text-muted-foreground">
              <Zap className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Canvas Vazio</p>
              <p className="text-sm">Adicione nós usando os botões acima para começar</p>
            </div>
          ) : (
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              workflowName={name}
            />
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Como usar o Canvas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="flex items-start gap-2">
            <span className="font-semibold">1.</span>
            <span>Adicione nós usando os botões de ferramentas</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="font-semibold">2.</span>
            <span>Arraste os nós para organizá-los no canvas</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="font-semibold">3.</span>
            <span>Conecte os nós clicando e arrastando da borda de um nó para outro</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="font-semibold">4.</span>
            <span>Use os controles no canto para zoom e navegação</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="font-semibold">5.</span>
            <span>Salve e publique quando estiver pronto</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
