import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
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

const conversations = [
  {
    id: 1,
    contact: 'Maria Silva',
    phone: '+55 11 99999-9999',
    lastMessage: 'Obrigada pelo atendimento!',
    time: '10:30',
    unread: 0,
    status: 'closed',
    channel: 'whatsapp',
    tags: ['Cliente VIP', 'Suporte'],
    agent: 'João Santos',
  },
  {
    id: 2,
    contact: 'Carlos Oliveira',
    phone: '+55 21 88888-8888',
    lastMessage: 'Preciso de ajuda com meu pedido',
    time: '09:45',
    unread: 3,
    status: 'open',
    channel: 'facebook',
    tags: ['Vendas'],
    agent: 'Ana Costa',
  },
  {
    id: 3,
    contact: 'Fernanda Lima',
    phone: '+55 31 77777-7777',
    lastMessage: 'Quando posso agendar uma visita?',
    time: '08:20',
    unread: 1,
    status: 'pending',
    channel: 'instagram',
    tags: ['Lead'],
    agent: null,
  },
];

const messages = [
  {
    id: 1,
    sender: 'contact',
    content: 'Olá! Gostaria de saber mais sobre seus produtos.',
    time: '09:30',
    type: 'text',
  },
  {
    id: 2,
    sender: 'agent',
    content: 'Olá Carlos! Ficamos felizes com seu interesse. Temos várias opções disponíveis. Sobre qual produto você gostaria de saber?',
    time: '09:32',
    type: 'text',
  },
  {
    id: 3,
    sender: 'contact',
    content: 'Estou interessado nos planos corporativos.',
    time: '09:35',
    type: 'text',
  },
  {
    id: 4,
    sender: 'agent',
    content: 'Perfeito! Vou enviar nossa apresentação completa dos planos corporativos.',
    time: '09:37',
    type: 'text',
  },
];

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
  const [selectedConversation, setSelectedConversation] = useState(conversations[1]);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.phone.includes(searchTerm) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Enviando mensagem:', messageText);
      setMessageText('');
    }
  };

  return (
    <Layout>
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
                    {filteredConversations.map((conversation) => (
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
                              <AvatarFallback>{conversation.contact.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1">
                              {getChannelIcon(conversation.channel)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">
                                {conversation.contact}
                              </h4>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-muted-foreground">
                                  {conversation.time}
                                </span>
                                {conversation.unread > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                    {conversation.unread}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {conversation.lastMessage}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {conversation.agent || 'Não atribuído'}
                                </span>
                              </div>
                              {conversation.tags.length > 0 && (
                                <div className="flex space-x-1">
                                  {conversation.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
                          <AvatarFallback>{selectedConversation.contact.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">
                          {getChannelIcon(selectedConversation.channel)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedConversation.contact}</h3>
                        <p className="text-sm text-muted-foreground">{selectedConversation.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select defaultValue={selectedConversation.agent}>
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
                  <div className="flex items-center space-x-2">
                    {selectedConversation.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender === 'agent'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span
                            className={`text-xs mt-1 block ${
                              message.sender === 'agent'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {message.time}
                          </span>
                        </div>
                      </div>
                    ))}
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
    </Layout>
  );
}