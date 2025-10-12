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
import { Progress } from '@/components/ui/progress';
import { 
  X, Save, Zap, MessageSquare, Clock, GitBranch, Mail, 
  Tag, Database, Settings, Image, File, Phone, Video, Mic,
  Upload, Sparkles, Trash2
} from 'lucide-react';
import { Node } from 'react-flow-renderer';
import { toast } from 'sonner';

interface NodeConfigPanelProps {
  node: Node | null;
  onClose: () => void;
  onSave: (nodeId: string, config: any) => void;
}

export function NodeConfigPanel({ node, onClose, onSave }: NodeConfigPanelProps) {
  const [config, setConfig] = useState(node?.data?.config || {});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [contactList, setContactList] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!node) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file size (max 16MB)
    const maxSize = 16 * 1024 * 1024;
    const oversized = files.filter(f => f.size > maxSize);
    
    if (oversized.length > 0) {
      toast.error('Alguns arquivos excedem 16MB');
      return;
    }
    
    setAttachments(prev => [...prev, ...files]);
    toast.success(`${files.length} arquivo(s) adicionado(s)`);
  };

  const handleContactListUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Use apenas arquivos CSV ou TXT');
      return;
    }
    
    setContactList(file);
    toast.success('Lista de contatos carregada');
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Simulate upload progress
    if (attachments.length > 0) {
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    const savedConfig = {
      ...config,
      label: config.label || node.data.label,
      attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type })),
      contactList: contactList ? { name: contactList.name, size: contactList.size } : undefined,
    };
    
    onSave(node.id, savedConfig);
    setUploadProgress(0);
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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (file.type.startsWith('audio/')) return <Mic className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

            {/* AI Enhancement Toggle */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Integração com IA</Label>
                  <p className="text-xs text-muted-foreground">
                    Usar IA para personalizar conteúdo
                  </p>
                </div>
              </div>
              <Switch
                checked={config.aiEnabled || false}
                onCheckedChange={(checked) => updateConfig('aiEnabled', checked)}
              />
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
                
                {/* File Attachments */}
                <div className="space-y-2">
                  <Label>Anexos (Mídia)</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <Image className="w-4 h-4 mr-2" />
                        Imagem
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <Video className="w-4 h-4 mr-2" />
                        Vídeo
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <File className="w-4 h-4 mr-2" />
                        Documento
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <Mic className="w-4 h-4 mr-2" />
                        Áudio
                        <input
                          type="file"
                          accept="audio/*"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </Button>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file)}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{file.name}</span>
                              <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(i)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Contact List Upload */}
                <div className="space-y-2">
                  <Label>Lista de Contatos (CSV/TXT)</Label>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <label className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      {contactList ? contactList.name : 'Importar Lista de Contatos'}
                      <input
                        type="file"
                        accept=".csv,.txt"
                        className="hidden"
                        onChange={handleContactListUpload}
                      />
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Arquivo CSV ou TXT com um contato por linha
                  </p>
                  {contactList && (
                    <Badge variant="secondary" className="w-full justify-center">
                      <File className="w-3 h-3 mr-1" />
                      {contactList.name} - {formatFileSize(contactList.size)}
                    </Badge>
                  )}
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

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="px-4 pb-2">
          <Progress value={uploadProgress} />
          <p className="text-xs text-center text-muted-foreground mt-1">
            Processando arquivos... {uploadProgress}%
          </p>
        </div>
      )}

      <div className="p-4 border-t flex gap-2">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSave} className="flex-1" disabled={uploadProgress > 0 && uploadProgress < 100}>
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>
    </Card>
  );
}
