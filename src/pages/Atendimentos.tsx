import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Phone, 
  Video, 
  Paperclip, 
  Send, 
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Smile,
  Mic,
  Image
} from 'lucide-react';

// Mock data for chats
const mockChats = [
  {
    id: '1',
    contact: 'Maria Santos',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    channel: 'WhatsApp',
    lastMessage: 'Obrigada pelo atendimento!',
    time: '14:35',
    unread: 0,
    status: 'resolved',
    tags: ['VIP'],
  },
  {
    id: '2',
    contact: 'João Silva',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    channel: 'Instagram',
    lastMessage: 'Preciso de ajuda com meu pedido',
    time: '14:20',
    unread: 3,
    status: 'pending',
    tags: ['Suporte'],
  },
  {
    id: '3',
    contact: 'Ana Costa',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    channel: 'Facebook',
    lastMessage: 'Gostaria de saber mais sobre os preços',
    time: '13:45',
    unread: 1,
    status: 'active',
    tags: ['Vendas'],
  },
];

const mockMessages = [
  {
    id: '1',
    sender: 'João Silva',
    message: 'Olá! Preciso de ajuda com meu pedido #1234',
    time: '14:15',
    type: 'received',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
  },
  {
    id: '2',
    sender: 'Você',
    message: 'Olá João! Claro, vou te ajudar. Deixe-me verificar seu pedido.',
    time: '14:16',
    type: 'sent',
  },
  {
    id: '3',
    sender: 'João Silva',
    message: 'Obrigado! O produto ainda não chegou aqui.',
    time: '14:17',
    type: 'received',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
  },
  {
    id: '4',
    sender: 'Você',
    message: 'Entendi. Vou consultar o status da entrega para você. Aguarde um momento.',
    time: '14:18',
    type: 'sent',
  },
  {
    id: '5',
    sender: 'João Silva',
    message: 'Preciso de ajuda com meu pedido',
    time: '14:20',
    type: 'received',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
  },
];

export default function Atendimentos() {
  const [selectedChat, setSelectedChat] = useState(mockChats[1]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'pending': return 'secondary';
      case 'active': return 'destructive';
      default: return 'outline';
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'WhatsApp': return 'bg-green-500';
      case 'Instagram': return 'bg-purple-500';
      case 'Facebook': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Here would be the logic to send message
      setNewMessage('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Atendimentos</h1>
          <p className="text-muted-foreground">
            Central omnichannel de atendimento
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Novo Chat
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[520px]">
              <div className="space-y-1 p-2">
                {mockChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat.id === chat.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={chat.avatar} />
                          <AvatarFallback>
                            {chat.contact.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getChannelColor(chat.channel)} flex items-center justify-center`}>
                          <MessageSquare className="h-2 w-2 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {chat.contact}
                          </p>
                          <div className="flex items-center space-x-1">
                            {chat.unread > 0 && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                {chat.unread}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {chat.time}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {chat.lastMessage}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex space-x-1">
                            {chat.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Badge variant={getStatusColor(chat.status)} className="text-xs">
                            {chat.status === 'resolved' && <CheckCircle className="mr-1 h-3 w-3" />}
                            {chat.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                            {chat.status === 'active' && <AlertCircle className="mr-1 h-3 w-3" />}
                            {chat.status === 'resolved' ? 'Resolvido' : 
                             chat.status === 'pending' ? 'Pendente' : 'Ativo'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="flex flex-row items-center space-y-0 pb-3 border-b">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedChat.avatar} />
              <AvatarFallback>
                {selectedChat.contact.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 ml-3">
              <h3 className="font-semibold">{selectedChat.contact}</h3>
              <p className="text-sm text-muted-foreground flex items-center">
                <div className={`w-2 h-2 rounded-full ${getChannelColor(selectedChat.channel)} mr-2`} />
                {selectedChat.channel} • Online
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/chamadas'}
                title="Iniciar chamada de voz"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/chamadas'}
                title="Iniciar videochamada"
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                title="Mais opções"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {mockMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-[70%] ${
                      message.type === 'sent' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {message.type === 'received' && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={message.avatar} />
                          <AvatarFallback className="text-xs">
                            {message.sender.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`rounded-2xl px-4 py-2 ${
                        message.type === 'sent' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'sent' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex items-end space-x-2">
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="min-h-[60px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Anexar arquivo"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Enviar imagem"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Gravar áudio"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Resposta Rápida
                    </Button>
                    <Button onClick={sendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}