import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Send,
  Paperclip,
  Clock,
  Users,
  Image as ImageIcon,
  File,
  Mic,
  Video,
  Upload,
  X,
  Sparkles,
} from 'lucide-react';
import { ChannelType, CHANNEL_LABELS } from '@/constants/channels';

interface MultiChannelComposerProps {
  channels: ChannelType[];
  onSend: (data: MessageData) => void;
}

interface MessageData {
  channel: ChannelType;
  content: string;
  attachments?: File[];
  scheduledAt?: string;
  bulkContacts?: string[];
  delayBetweenMs?: number;
  aiEnhanced?: boolean;
}

export function MultiChannelComposer({ channels, onSend }: MultiChannelComposerProps) {
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>(channels[0] || 'whatsapp');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkContacts, setBulkContacts] = useState('');
  const [delayBetween, setDelayBetween] = useState('1000');
  const [contactListFile, setContactListFile] = useState<File | null>(null);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const validTypes = ['image/', 'video/', 'audio/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'];
    const invalidFiles = files.filter(file => !validTypes.some(type => file.type.startsWith(type)));
    
    if (invalidFiles.length > 0) {
      toast.error('Alguns arquivos não são suportados');
      return;
    }

    // Check file sizes (max 16MB per file for WhatsApp)
    const maxSize = 16 * 1024 * 1024; // 16MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error('Alguns arquivos excedem o tamanho máximo de 16MB');
      return;
    }

    setAttachments((prev) => [...prev, ...files]);
    toast.success(`${files.length} arquivo(s) adicionado(s)`);
  };

  const handleContactListUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Por favor, envie um arquivo CSV ou TXT');
      return;
    }

    setContactListFile(file);
    
    // Read and parse the file
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Extract phone numbers (assuming one per line or CSV with phone in first column)
      const phones = lines.map(line => {
        const parts = line.split(',');
        return parts[0].trim();
      }).filter(phone => phone.match(/^\+?\d{10,15}$/));

      if (phones.length === 0) {
        toast.error('Nenhum número válido encontrado no arquivo');
        return;
      }

      setBulkContacts(phones.join('\n'));
      toast.success(`${phones.length} contatos carregados do arquivo`);
    };
    
    reader.readAsText(file);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) {
      toast.error('Digite uma mensagem ou anexe um arquivo');
      return;
    }

    if (bulkMode) {
      const contacts = bulkContacts.split('\n').filter((c) => c.trim());
      if (contacts.length === 0) {
        toast.error('Adicione pelo menos um contato');
        return;
      }

      // Simulate upload progress for attachments
      if (attachments.length > 0) {
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      onSend({
        channel: selectedChannel,
        content,
        attachments,
        bulkContacts: contacts,
        delayBetweenMs: parseInt(delayBetween),
        aiEnhanced,
      });

      toast.success(`Disparo em massa iniciado para ${contacts.length} contatos`);
      
      // Clear form
      setContent('');
      setAttachments([]);
      setBulkContacts('');
      setContactListFile(null);
      setUploadProgress(0);
    } else if (scheduledAt) {
      onSend({
        channel: selectedChannel,
        content,
        attachments,
        scheduledAt,
        aiEnhanced,
      });

      toast.success('Mensagem agendada com sucesso');
      
      // Clear form
      setContent('');
      setAttachments([]);
      setScheduledAt('');
    } else {
      onSend({
        channel: selectedChannel,
        content,
        attachments,
        aiEnhanced,
      });

      toast.success('Mensagem enviada');
      
      // Clear form
      setContent('');
      setAttachments([]);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (file.type.startsWith('audio/')) return <Mic className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Enviar Mensagem</span>
          <div className="flex items-center gap-2">
            <Select value={selectedChannel} onValueChange={(v) => setSelectedChannel(v as ChannelType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {CHANNEL_LABELS[channel]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="single" onValueChange={(v) => setBulkMode(v === 'bulk')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">
              <Send className="w-4 h-4 mr-2" />
              Enviar Agora
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              <Clock className="w-4 h-4 mr-2" />
              Agendar
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <Users className="w-4 h-4 mr-2" />
              Disparo em Massa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <div>
              <Textarea
                placeholder="Digite sua mensagem..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <div>
              <Textarea
                placeholder="Digite sua mensagem..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Agendar para</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <div>
              <Textarea
                placeholder="Digite sua mensagem..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Lista de Contatos</Label>
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Importar CSV/TXT
                    <input
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={handleContactListUpload}
                    />
                  </label>
                </Button>
              </div>
              
              {contactListFile && (
                <Badge variant="secondary" className="mb-2">
                  <File className="w-3 h-3 mr-1" />
                  {contactListFile.name}
                </Badge>
              )}
              
              <Textarea
                placeholder="+5511999999999&#10;+5521888888888&#10;+5531777777777"
                value={bulkContacts}
                onChange={(e) => setBulkContacts(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Digite os números no formato: +55DDD9XXXXXXXX (um por linha) ou importe um arquivo CSV/TXT
              </p>
              {bulkContacts && (
                <p className="text-xs font-medium">
                  {bulkContacts.split('\n').filter(c => c.trim()).length} contatos adicionados
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Delay entre envios (ms)</Label>
              <Input
                type="number"
                value={delayBetween}
                onChange={(e) => setDelayBetween(e.target.value)}
                min="100"
                step="100"
              />
              <p className="text-xs text-muted-foreground">
                Tempo de espera entre cada mensagem (recomendado: 1000-2000ms)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Enhancement Toggle */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <div>
              <Label className="text-sm font-medium">Aprimorar com IA</Label>
              <p className="text-xs text-muted-foreground">
                A IA irá personalizar e otimizar sua mensagem
              </p>
            </div>
          </div>
          <Button
            variant={aiEnhanced ? "default" : "outline"}
            size="sm"
            onClick={() => setAiEnhanced(!aiEnhanced)}
          >
            {aiEnhanced ? 'Ativado' : 'Desativado'}
          </Button>
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <Label>Anexos</Label>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <ImageIcon className="w-4 h-4 mr-2" />
                Imagem
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
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
                  onChange={handleFileChange}
                />
              </label>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <File className="w-4 h-4 mr-2" />
                Documento
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
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
                  onChange={handleFileChange}
                />
              </label>
            </Button>
          </div>
          
          {attachments.length > 0 && (
            <div className="space-y-2 mt-3">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
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
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <Label>Enviando arquivos...</Label>
            <Progress value={uploadProgress} />
          </div>
        )}

        <Button onClick={handleSend} className="w-full" disabled={uploadProgress > 0 && uploadProgress < 100}>
          <Send className="w-4 h-4 mr-2" />
          {bulkMode ? 'Iniciar Disparo' : scheduledAt ? 'Agendar' : 'Enviar'}
        </Button>
      </CardContent>
    </Card>
  );
}
