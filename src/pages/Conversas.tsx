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
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  Clock,
  User,
  Tag,
  Send,
  Paperclip,
  Smile,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth';

interface Conversation {
  id: string;
  contact: { name: string; phone: string } | null;
  last_message: { content: string; created_at: string } | null;
  unread_count: number;
  status: string;
  channel: string;
  updated_at: string;
}

interface Message {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  status: string;
}

const getChannelIcon = (channel: string) => {
  switch (channel) {
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
  switch (status) {
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Realtime updates
    const channel = supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, () => loadConversations())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation?.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      // @ts-ignore - Table exists in database
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          status,
          channel,
          unread_count,
          updated_at,
          contact:contact_id(name, phone),
          last_message:messages(content, created_at)
        `)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
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
      // @ts-ignore - Table exists in database
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar mensagens');
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      // @ts-ignore - Table exists in database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          content: messageText,
          direction: 'outbound',
          status: 'sent'
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setMessageText('');
      toast.success('Mensagem enviada');
    } catch (error: any) {
      toast.error('Erro ao enviar mensagem');
      console.error(error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.contact?.phone?.includes(searchTerm) ||
    conv.last_message?.content?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              WhatsApp: Conectado
            </Badge>
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
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="open">Abertas</TabsTrigger>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                  <TabsTrigger value="closed">Fechadas</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-0">
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
                                  {typeof conversation.contact === 'object' && conversation.contact?.name 
                                    ? conversation.contact.name.charAt(0) 
                                    : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1">
                                {getChannelIcon(conversation.channel)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm truncate">
                                  {typeof conversation.contact === 'object' && conversation.contact?.name 
                                    ? conversation.contact.name 
                                    : 'Sem nome'}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-muted-foreground">
                                    {conversation.last_message?.created_at ? 
                                      new Date(conversation.last_message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 
                                      '--:--'
                                    }
                                  </span>
                                  {conversation.unread_count > 0 && (
                                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                      {conversation.unread_count}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {conversation.last_message?.content || 'Sem mensagens'}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`}
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    {conversation.status}
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
                            {typeof selectedConversation.contact === 'string' 
                              ? selectedConversation.contact.charAt(0) 
                              : selectedConversation.contact?.name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">
                          {getChannelIcon(selectedConversation.channel)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {typeof selectedConversation.contact === 'object' && selectedConversation.contact?.name 
                            ? selectedConversation.contact.name 
                            : 'Sem nome'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {typeof selectedConversation.contact === 'object' && selectedConversation.contact?.phone 
                            ? selectedConversation.contact.phone 
                            : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select defaultValue="joao">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Atribuir agente" />
                        </SelectTrigger>
                        <SelectContent>
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
                  {/* Tags removidas para dados reais */}
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
                              {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Separator />

                  <div className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Smile className="h-4 w-4" />
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
      </motion.div>
  );
}