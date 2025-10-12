import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, Save, Zap, MessageSquare, Clock, GitBranch, Mail, 
  Tag, Database, Settings, Image, File, Phone 
} from 'lucide-react';
import { Node } from 'react-flow-renderer';

interface NodeConfigPanelProps {
  node: Node | null;
  onClose: () => void;
  onSave: (nodeId: string, config: any) => void;
}

export function NodeConfigPanel({ node, onClose, onSave }: NodeConfigPanelProps) {
  const [config, setConfig] = useState(node?.data?.config || {});

  if (!node) return null;

  const handleSave = () => {
    onSave(node.id, config);
    onClose();
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Zap className="h-5 w-5 text-blue-600" />;
      case 'action': return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'condition': return <GitBranch className="h-5 w-5 text-yellow-600" />;
      case 'delay': return <Clock className="h-5 w-5 text-purple-600" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const renderConfigFields = () => {
    const actionType = config.actionType || node.data?.actionType || 'send_message';

    switch (node.type) {
      case 'trigger':
        return (
          <div className="space-y-4">
            <div>
              <Label>Tipo de Gatilho</Label>
              <Select 
                value={config.triggerType || 'message_received'}
                onValueChange={(v) => updateConfig('triggerType', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message_received">Mensagem Recebida</SelectItem>
                  <SelectItem value="keyword">Palavra-chave</SelectItem>
                  <SelectItem value="schedule">Agendamento</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.triggerType === 'keyword' && (
              <div>
                <Label>Palavra-chave</Label>
                <Input 
                  value={config.keyword || ''}
                  onChange={(e) => updateConfig('keyword', e.target.value)}
                  placeholder="Ex: oi, olá, menu"
                />
              </div>
            )}

            {config.triggerType === 'schedule' && (
              <div>
                <Label>Expressão Cron</Label>
                <Input 
                  value={config.cron || ''}
                  onChange={(e) => updateConfig('cron', e.target.value)}
                  placeholder="Ex: 0 9 * * *"
                />
              </div>
            )}
          </div>
        );

      case 'action':
        return (
          <div className="space-y-4">
            <div>
              <Label>Tipo de Ação</Label>
              <Select 
                value={actionType}
                onValueChange={(v) => updateConfig('actionType', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="send_message">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Enviar Mensagem
                    </div>
                  </SelectItem>
                  <SelectItem value="send_email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Enviar E-mail
                    </div>
                  </SelectItem>
                  <SelectItem value="send_image">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Enviar Imagem
                    </div>
                  </SelectItem>
                  <SelectItem value="send_document">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      Enviar Documento
                    </div>
                  </SelectItem>
                  <SelectItem value="add_tag">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Adicionar Tag
                    </div>
                  </SelectItem>
                  <SelectItem value="update_field">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Atualizar Campo
                    </div>
                  </SelectItem>
                  <SelectItem value="call_webhook">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Chamar Webhook
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {actionType === 'send_message' && (
              <>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea 
                    value={config.message || ''}
                    onChange={(e) => updateConfig('message', e.target.value)}
                    placeholder="Digite sua mensagem..."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use variáveis: {'{'}nome{'}'}, {'{'}email{'}'}, {'{'}telefone{'}'}
                  </p>
                </div>
              </>
            )}

            {actionType === 'send_email' && (
              <>
                <div>
                  <Label>Assunto</Label>
                  <Input 
                    value={config.subject || ''}
                    onChange={(e) => updateConfig('subject', e.target.value)}
                    placeholder="Assunto do e-mail"
                  />
                </div>
                <div>
                  <Label>Corpo do E-mail</Label>
                  <Textarea 
                    value={config.emailBody || ''}
                    onChange={(e) => updateConfig('emailBody', e.target.value)}
                    placeholder="Conteúdo do e-mail..."
                    rows={5}
                  />
                </div>
              </>
            )}

            {actionType === 'send_image' && (
              <>
                <div>
                  <Label>URL da Imagem</Label>
                  <Input 
                    value={config.imageUrl || ''}
                    onChange={(e) => updateConfig('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label>Legenda (opcional)</Label>
                  <Textarea 
                    value={config.caption || ''}
                    onChange={(e) => updateConfig('caption', e.target.value)}
                    placeholder="Legenda da imagem..."
                    rows={2}
                  />
                </div>
              </>
            )}

            {actionType === 'send_document' && (
              <>
                <div>
                  <Label>URL do Documento</Label>
                  <Input 
                    value={config.documentUrl || ''}
                    onChange={(e) => updateConfig('documentUrl', e.target.value)}
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
                <div>
                  <Label>Nome do Arquivo</Label>
                  <Input 
                    value={config.fileName || ''}
                    onChange={(e) => updateConfig('fileName', e.target.value)}
                    placeholder="documento.pdf"
                  />
                </div>
              </>
            )}

            {actionType === 'add_tag' && (
              <div>
                <Label>Nome da Tag</Label>
                <Input 
                  value={config.tagName || ''}
                  onChange={(e) => updateConfig('tagName', e.target.value)}
                  placeholder="Ex: cliente-vip"
                />
              </div>
            )}

            {actionType === 'update_field' && (
              <>
                <div>
                  <Label>Campo</Label>
                  <Input 
                    value={config.fieldName || ''}
                    onChange={(e) => updateConfig('fieldName', e.target.value)}
                    placeholder="Ex: status"
                  />
                </div>
                <div>
                  <Label>Valor</Label>
                  <Input 
                    value={config.fieldValue || ''}
                    onChange={(e) => updateConfig('fieldValue', e.target.value)}
                    placeholder="Ex: ativo"
                  />
                </div>
              </>
            )}

            {actionType === 'call_webhook' && (
              <>
                <div>
                  <Label>URL do Webhook</Label>
                  <Input 
                    value={config.webhookUrl || ''}
                    onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                    placeholder="https://api.example.com/webhook"
                  />
                </div>
                <div>
                  <Label>Método</Label>
                  <Select 
                    value={config.method || 'POST'}
                    onValueChange={(v) => updateConfig('method', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label>Campo a Verificar</Label>
              <Input 
                value={config.field || ''}
                onChange={(e) => updateConfig('field', e.target.value)}
                placeholder="Ex: status, tipo, valor"
              />
            </div>
            
            <div>
              <Label>Operador</Label>
              <Select 
                value={config.operator || 'equals'}
                onValueChange={(v) => updateConfig('operator', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Igual a</SelectItem>
                  <SelectItem value="not_equals">Diferente de</SelectItem>
                  <SelectItem value="contains">Contém</SelectItem>
                  <SelectItem value="not_contains">Não contém</SelectItem>
                  <SelectItem value="greater_than">Maior que</SelectItem>
                  <SelectItem value="less_than">Menor que</SelectItem>
                  <SelectItem value="starts_with">Começa com</SelectItem>
                  <SelectItem value="ends_with">Termina com</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor</Label>
              <Input 
                value={config.value || ''}
                onChange={(e) => updateConfig('value', e.target.value)}
                placeholder="Valor para comparação"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quando a condição for:</Label>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline" className="justify-center py-2">
                  ✓ Verdadeira → Próximo nó
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  ✗ Falsa → Nó alternativo
                </Badge>
              </div>
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <Label>Tempo de Espera</Label>
              <div className="flex gap-2">
                <Input 
                  type="number"
                  value={config.duration || ''}
                  onChange={(e) => updateConfig('duration', e.target.value)}
                  placeholder="5"
                  className="w-24"
                />
                <Select 
                  value={config.unit || 'minutes'}
                  onValueChange={(v) => updateConfig('unit', v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Segundos</SelectItem>
                    <SelectItem value="minutes">Minutos</SelectItem>
                    <SelectItem value="hours">Horas</SelectItem>
                    <SelectItem value="days">Dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="skip-weekends">Pular Fins de Semana</Label>
              <Switch
                id="skip-weekends"
                checked={config.skipWeekends || false}
                onCheckedChange={(checked) => updateConfig('skipWeekends', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="skip-holidays">Pular Feriados</Label>
              <Switch
                id="skip-holidays"
                checked={config.skipHolidays || false}
                onCheckedChange={(checked) => updateConfig('skipHolidays', checked)}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Selecione um tipo de nó para configurar</p>
          </div>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center gap-2">
          {getNodeIcon(node.type || 'action')}
          <CardTitle className="text-lg">
            Configurar: {node.data?.label || 'Nó'}
          </CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto pt-6">
        <div className="space-y-4">
          <div>
            <Label>Nome do Nó</Label>
            <Input 
              value={config.label || node.data?.label || ''}
              onChange={(e) => updateConfig('label', e.target.value)}
              placeholder="Nome descritivo"
            />
          </div>

          <Separator />

          {renderConfigFields()}
        </div>
      </CardContent>

      <div className="p-4 border-t flex gap-2">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSave} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>
    </Card>
  );
}