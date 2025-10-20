import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  User,
  Send,
  Paperclip,
  Smile,
  MessageCircle,
  Hash,
  Users,
  Sparkles,
  Languages,
  FileText,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth';
import { conversasService } from '@/services/conversas';
import { whatsappService } from '@/services/whatsapp';
import { MultiChannelComposer } from '@/components/MultiChannelComposer';
import { useSocket } from '@/hooks/useSocket';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  contact?: { name: string; phone: string } | null;
  messages?: { content: string; createdAt: string }[];
  unreadCount?: number;
  status: string;
  channel: string;
  lastMessageAt?: string;
}

interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  createdAt: string;
  status: string;
}

const getChannelIcon = (channel: string) => {
  const channelLower = channel.toLowerCase();
  switch (channelLower) {
    case 'whatsapp':
      return <Phone className="h-4 w-4 text-green-600" />;
    case 'facebook':
      return <MessageCircle className="h-4 w-4 text-blue-600" />;
    case 'instagram':
      return <Hash className="h-4 w-4 text-pink-600" />;
    default:
      return <MessageCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'open':
      return 'bg-green-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'closed':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export default function Conversas() {
  const { user } = useAuthStore();
  const { connected } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showBulkComposer, setShowBulkComposer] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiDraftResponse, setAiDraftResponse] = useState('');
  const [aiAssistSettings, setAiAssistSettings] = useState({
    useSnippets: true,
    replyOutsideKnowledge: false,
    tone: 'neutral' as 'casual' | 'neutral' | 'formal',
    language: 'pt-BR'
  });

  useEffect(() => {
    loadConversations();
  }, [filterStatus]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Supabase Realtime for messages
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversationId=eq.${selectedConversation.id}`
        },
        (payload) => {
          console.log('[Realtime] New message:', payload);
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  // Supabase Realtime for conversations list
  useEffect(() => {
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('[Realtime] Conversation updated:', payload);
          setConversations(prev =>
            prev.map(conv =>
              conv.id === payload.new.id ? { ...conv, ...payload.new } : conv
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (filterStatus && filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      
      const { data } = await conversasService.getConversations(filters);
      setConversations(data || []);
      
      if (data && data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar conversas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data } = await conversasService.getMessages(conversationId);
      setMessages(data || []);
      
      // Mark as read
      await conversasService.markAsRead(conversationId);
    } catch (error: any) {
      toast.error('Erro ao carregar mensagens');
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await conversasService.sendMessage({
        conversationId: selectedConversation.id,
        content: messageText,
        type: 'text'
      });

      setMessageText('');
      toast.success('Mensagem enviada');
      
      // Reload messages
      loadMessages(selectedConversation.id);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar mensagem');
      console.error(error);
    }
  };

  const handleBulkSend = async (data: any) => {
    if (!data.bulkContacts || data.bulkContacts.length === 0) {
      toast.error('Adicione contatos para o disparo');
      return;
    }
    
    try {
      const mockConnectionId = 'whatsapp-connection-1';
      
      const result = await whatsappService.sendBulkMessages(mockConnectionId, {
        contacts: data.bulkContacts,
        message: { text: data.content },
        delayMs: data.delayBetweenMs || 1000
      });
      
      toast.success(`Disparo iniciado! ${result.totalContacts} mensagens serão enviadas.`);
      setShowBulkComposer(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao iniciar disparo');
    }
  };

  const handleAIAssist = async () => {
    if (!selectedConversation) return;
    
    setShowAIAssist(true);
    
    // Simula geração de resposta pela IA
    setTimeout(() => {
      setAiDraftResponse('Olá! Entendo sua dúvida. Baseado na nossa base de conhecimento, posso ajudá-lo da seguinte forma: [resposta contextual gerada pela IA usando RAG]');
    }, 1500);
  };

  const handleUseAIDraft = () => {
    setMessageText(aiDraftResponse);
    setShowAIAssist(false);
    toast.success('Rascunho da IA inserido');
  };

  const handleAIPrompt = async (promptType: string) => {
    if (!messageText.trim()) {
      toast.error('Digite uma mensagem primeiro');
      return;
    }

    let result = messageText;
    
    switch(promptType) {
      case 'translate':
        result = `[Texto traduzido]: ${messageText}`;
        break;
      case 'tone':
        result = `[Tom ajustado]: ${messageText}`;
        break;
      case 'fix':
        result = messageText.replace(/erros/g, 'correções');
        break;
      case 'simplify':
        result = `[Versão simplificada]: ${messageText}`;
        break;
    }
    
    setMessageText(result);
    toast.success('Prompt aplicado');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.contact?.phone?.includes(searchTerm)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Conversas</h1>
          <p className="text-muted-foreground">Inbox omnichannel unificado</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className={connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
            Socket: {connected ? 'Conectado' : 'Desconectado'}
          </Badge>
          <Button size="sm" onClick={() => setShowBulkComposer(true)}>
            <Users className="h-4 w-4 mr-2" />
            Disparo em Massa
          </Button>
          <Button size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Lista de Conversas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversas</CardTitle>
              <Badge variant="outline">{conversations.length}</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" value={filterStatus} onValueChange={setFilterStatus} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="OPEN">Abertas</TabsTrigger>
                <TabsTrigger value="PENDING">Pendentes</TabsTrigger>
                <TabsTrigger value="CLOSED">Fechadas</TabsTrigger>
              </TabsList>
              <TabsContent value={filterStatus} className="mt-0">
                <div className="space-y-1">
                  {loading ? (
                    <div className="p-4 text-center text-muted-foreground">Carregando...</div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">Nenhuma conversa encontrada</div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {conversation.contact?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1">
                              {getChannelIcon(conversation.channel)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">
                                {conversation.contact?.name || 'Sem nome'}
                              </h4>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-muted-foreground">
                                  {conversation.lastMessageAt ? 
                                    new Date(conversation.lastMessageAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 
                                    '--:--'
                                  }
                                </span>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {conversation.messages && conversation.messages.length > 0 
                                ? conversation.messages[0].content 
                                : 'Sem mensagens'}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`}
                                />
                                <span className="text-xs text-muted-foreground capitalize">
                                  {conversation.status.toLowerCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {selectedConversation.contact?.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        {getChannelIcon(selectedConversation.channel)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConversation.contact?.name || 'Sem nome'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.contact?.phone || ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="unassigned">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Atribuir agente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Sem agente</SelectItem>
                        <SelectItem value="joao">João Santos</SelectItem>
                        <SelectItem value="ana">Ana Costa</SelectItem>
                        <SelectItem value="pedro">Pedro Lima</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">Nenhuma mensagem ainda</div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.direction === 'outbound'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span
                            className={`text-xs mt-1 block ${
                              message.direction === 'outbound'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                <div className="p-4 space-y-3">
                  {/* AI Assist Draft */}
                  {showAIAssist && (
                    <Card className="p-3 bg-primary/5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <Label className="text-sm font-semibold">AI Assist - Rascunho</Label>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowAIAssist(false)}
                        >
                          ✕
                        </Button>
                      </div>
                      <p className="text-sm mb-3">{aiDraftResponse || 'Gerando resposta...'}</p>
                      <Button size="sm" onClick={handleUseAIDraft} disabled={!aiDraftResponse}>
                        Usar este rascunho
                      </Button>
                    </Card>
                  )}
                  
                  {/* AI Prompts */}
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => handleAIPrompt('tone')}>
                      <Zap className="h-3 w-3 mr-1" />
                      Mudar Tom
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAIPrompt('translate')}>
                      <Languages className="h-3 w-3 mr-1" />
                      Traduzir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAIPrompt('fix')}>
                      <FileText className="h-3 w-3 mr-1" />
                      Corrigir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAIPrompt('simplify')}>
                      <Smile className="h-3 w-3 mr-1" />
                      Simplificar
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAIAssist}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
                <p className="text-muted-foreground">
                  Escolha uma conversa da lista para começar a responder
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Dialog de Disparo em Massa */}
      <Dialog open={showBulkComposer} onOpenChange={setShowBulkComposer}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Disparo em Massa - WhatsApp</DialogTitle>
          </DialogHeader>
          <MultiChannelComposer
            channels={['whatsapp']}
            onSend={handleBulkSend}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
