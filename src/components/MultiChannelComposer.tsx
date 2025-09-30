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
import { toast } from 'sonner';
import {
  Send,
  Paperclip,
  Clock,
  Users,
  Image as ImageIcon,
  File,
  Mic,
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
}

export function MultiChannelComposer({ channels, onSend }: MultiChannelComposerProps) {
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>(channels[0] || 'whatsapp');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkContacts, setBulkContacts] = useState('');
  const [delayBetween, setDelayBetween] = useState('1000');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleSend = () => {
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

      onSend({
        channel: selectedChannel,
        content,
        attachments,
        bulkContacts: contacts,
        delayBetweenMs: parseInt(delayBetween),
      });

      toast.success(`Disparo em massa iniciado para ${contacts.length} contatos`);
    } else if (scheduledAt) {
      onSend({
        channel: selectedChannel,
        content,
        attachments,
        scheduledAt,
      });

      toast.success('Mensagem agendada com sucesso');
    } else {
      onSend({
        channel: selectedChannel,
        content,
        attachments,
      });

      toast.success('Mensagem enviada');
    }

    // Clear form
    setContent('');
    setAttachments([]);
    setScheduledAt('');
    setBulkContacts('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Enviar Mensagem</span>
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
              <Label>Contatos (um por linha)</Label>
              <Textarea
                placeholder="+55 11 99999-9999&#10;+55 21 88888-8888"
                value={bulkContacts}
                onChange={(e) => setBulkContacts(e.target.value)}
                rows={4}
              />
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
                Tempo de espera entre cada mensagem (recomendado: 1000ms)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Attachments */}
        <div className="space-y-2">
          <Label>Anexos</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <ImageIcon className="w-4 h-4 mr-2" />
                Imagem
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <File className="w-4 h-4 mr-2" />
                Arquivo
                <input
                  type="file"
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
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </Button>
          </div>
          {attachments.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {attachments.length} arquivo(s) selecionado(s)
            </div>
          )}
        </div>

        <Button onClick={handleSend} className="w-full">
          <Send className="w-4 h-4 mr-2" />
          {bulkMode ? 'Iniciar Disparo' : scheduledAt ? 'Agendar' : 'Enviar'}
        </Button>
      </CardContent>
    </Card>
  );
}
