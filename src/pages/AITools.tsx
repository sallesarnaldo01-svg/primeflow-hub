import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Play, Trash2, Edit } from 'lucide-react';
import { aiToolsService, AITool } from '@/services/aiTools';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function AITools() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpoint: '',
    method: 'GET',
    parameters: '{}',
    headers: '{}',
  });

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const data = await aiToolsService.list();
      setTools(data);
    } catch (error) {
      toast.error('Erro ao carregar ferramentas');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        parameters: JSON.parse(formData.parameters),
        headers: formData.headers ? JSON.parse(formData.headers) : undefined,
      };

      if (editingTool) {
        await aiToolsService.update(editingTool.id, data);
        toast.success('Ferramenta atualizada');
      } else {
        await aiToolsService.create(data);
        toast.success('Ferramenta criada');
      }

      setDialogOpen(false);
      setEditingTool(null);
      setFormData({
        name: '',
        description: '',
        endpoint: '',
        method: 'GET',
        parameters: '{}',
        headers: '{}',
      });
      loadTools();
    } catch (error) {
      toast.error('Erro ao salvar ferramenta');
    }
  };

  const handleTest = async (tool: AITool) => {
    try {
      toast.loading('Testando ferramenta...');
      await aiToolsService.test(tool.id, {});
      toast.success('Ferramenta testada com sucesso');
    } catch (error) {
      toast.error('Erro ao testar ferramenta');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await aiToolsService.delete(id);
      toast.success('Ferramenta deletada');
      loadTools();
    } catch (error) {
      toast.error('Erro ao deletar ferramenta');
    }
  };

  const handleEdit = (tool: AITool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description,
      endpoint: tool.endpoint,
      method: tool.method,
      parameters: JSON.stringify(tool.parameters, null, 2),
      headers: tool.headers ? JSON.stringify(tool.headers, null, 2) : '{}',
    });
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ferramentas de IA</h1>
          <p className="text-muted-foreground">
            Configure ferramentas customizadas para Function Calling
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ferramenta
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Card key={tool.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{tool.name}</h3>
                  <Badge variant={tool.active ? 'default' : 'secondary'}>
                    {tool.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(tool)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(tool.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {tool.description}
              </p>
              <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                <Badge variant="outline">{tool.method}</Badge>
                <span className="truncate">{tool.endpoint}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handleTest(tool)}
              >
                <Play className="mr-2 h-3 w-3" />
                Testar
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTool ? 'Editar' : 'Nova'} Ferramenta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="puxarCNPJ"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Busca dados de empresa por CNPJ"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Método</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) =>
                    setFormData({ ...formData, method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Endpoint</Label>
                <Input
                  value={formData.endpoint}
                  onChange={(e) =>
                    setFormData({ ...formData, endpoint: e.target.value })
                  }
                  placeholder="https://api.example.com/cnpj"
                />
              </div>
            </div>
            <div>
              <Label>Parâmetros (JSON Schema)</Label>
              <Textarea
                value={formData.parameters}
                onChange={(e) =>
                  setFormData({ ...formData, parameters: e.target.value })
                }
                placeholder='{"cnpj": {"type": "string"}}'
                className="font-mono text-xs"
                rows={6}
              />
            </div>
            <div>
              <Label>Headers (JSON)</Label>
              <Textarea
                value={formData.headers}
                onChange={(e) =>
                  setFormData({ ...formData, headers: e.target.value })
                }
                placeholder='{"Authorization": "Bearer token"}'
                className="font-mono text-xs"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
