import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Edit } from 'lucide-react';
import { customFieldsService, CustomField } from '@/services/customFields';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CamposCustomizados() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<'lead' | 'contact' | 'deal'>('lead');
  const [formData, setFormData] = useState({
    entity: 'lead',
    name: '',
    type: 'text',
    options: '',
    required: false,
  });

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const data = await customFieldsService.list();
      setFields(data);
    } catch (error) {
      toast.error('Erro ao carregar campos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        label: formData.name,
        options: formData.options ? formData.options.split(',').map(o => o.trim()) : [],
      };

      if (editingField) {
        await customFieldsService.update(editingField.id, data);
        toast.success('Campo atualizado');
      } else {
        await customFieldsService.create(data);
        toast.success('Campo criado');
      }

      setDialogOpen(false);
      setEditingField(null);
      setFormData({
        entity: 'lead',
        name: '',
        type: 'text',
        options: '',
        required: false,
      });
      loadFields();
    } catch (error) {
      toast.error('Erro ao salvar campo');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await customFieldsService.delete(id);
      toast.success('Campo deletado');
      loadFields();
    } catch (error) {
      toast.error('Erro ao deletar campo');
    }
  };

  const handleEdit = (field: CustomField) => {
    setEditingField(field);
    setFormData({
      entity: field.entity,
      name: field.name,
      type: field.type,
      options: Array.isArray(field.options) ? field.options.join(', ') : '',
      required: field.required,
    });
    setDialogOpen(true);
  };

  const filteredFields = fields.filter(f => f.entity === selectedEntity);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Campos Customizados</h1>
          <p className="text-muted-foreground">
            Configure campos personalizados para entidades
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Campo
        </Button>
      </div>

      <Tabs value={selectedEntity} onValueChange={(v: any) => setSelectedEntity(v)}>
        <TabsList>
          <TabsTrigger value="lead">Leads</TabsTrigger>
          <TabsTrigger value="contact">Contatos</TabsTrigger>
          <TabsTrigger value="deal">Negócios</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedEntity} className="mt-6">
          {loading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFields.map((field) => (
                <Card key={field.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{field.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{field.type}</Badge>
                        {field.required && (
                          <Badge variant="destructive">Obrigatório</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(field)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(field.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {field.options && field.options.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Opções: {field.options.join(', ')}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Editar' : 'Novo'} Campo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Entidade</Label>
              <Select
                value={formData.entity}
                onValueChange={(value) =>
                  setFormData({ ...formData, entity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="contact">Contato</SelectItem>
                  <SelectItem value="deal">Negócio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome do Campo</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="cpf"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="select">Seleção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === 'select' && (
              <div>
                <Label>Opções (separadas por vírgula)</Label>
                <Input
                  value={formData.options}
                  onChange={(e) =>
                    setFormData({ ...formData, options: e.target.value })
                  }
                  placeholder="Opção 1, Opção 2, Opção 3"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.required}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, required: checked })
                }
              />
              <Label>Campo obrigatório</Label>
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
