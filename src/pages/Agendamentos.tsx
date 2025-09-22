import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  MapPin,
  User,
  Phone,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
} from 'lucide-react';

const appointments = [
  {
    id: 1,
    title: 'Reunião de Follow-up',
    contact: 'Maria Silva',
    phone: '+55 11 99999-9999',
    date: '2024-01-16',
    time: '10:00',
    duration: 60,
    type: 'video',
    status: 'confirmed',
    location: 'Google Meet',
    notes: 'Discutir proposta comercial e próximos passos',
    agent: 'João Santos',
    channel: 'whatsapp',
  },
  {
    id: 2,
    title: 'Apresentação de Produto',
    contact: 'Carlos Oliveira',
    phone: '+55 21 88888-8888',
    date: '2024-01-16',
    time: '14:30',
    duration: 45,
    type: 'presencial',
    status: 'pending',
    location: 'Escritório - Sala 3',
    notes: 'Demonstração completa da plataforma',
    agent: 'Ana Costa',
    channel: 'facebook',
  },
  {
    id: 3,
    title: 'Suporte Técnico',
    contact: 'Fernanda Lima',
    phone: '+55 31 77777-7777',
    date: '2024-01-17',
    time: '09:00',
    duration: 30,
    type: 'phone',
    status: 'confirmed',
    location: 'Telefone',
    notes: 'Ajuda com configuração inicial',
    agent: 'Pedro Lima',
    channel: 'instagram',
  },
];

const todayAppointments = appointments.filter(
  apt => apt.date === '2024-01-16'
);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'pending':
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'phone':
      return <Phone className="h-4 w-4" />;
    case 'presencial':
      return <MapPin className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

export default function Agendamentos() {
  const [selectedDate, setSelectedDate] = useState('2024-01-16');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = appointments.filter(apt =>
    apt.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendConfirmation = (appointment: any) => {
    // Simular envio de confirmação via WhatsApp
    console.log(`Enviando confirmação para ${appointment.contact} via ${appointment.channel}`);
  };

  const handleSendReminder = (appointment: any) => {
    // Simular envio de lembrete
    console.log(`Enviando lembrete para ${appointment.contact}`);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agendamentos</h1>
            <p className="text-muted-foreground">
              Gerencie reuniões e compromissos com envio automático no WhatsApp
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar agendamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input placeholder="Ex: Reunião de apresentação" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contato</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar contato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maria">Maria Silva</SelectItem>
                        <SelectItem value="carlos">Carlos Oliveira</SelectItem>
                        <SelectItem value="fernanda">Fernanda Lima</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração (min)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Duração" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="90">1h 30min</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de reunião" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Vídeo conferência</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                        <SelectItem value="presencial">Presencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Local/Link</Label>
                    <Input placeholder="Ex: Google Meet, Zoom, Endereço..." />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Observações</Label>
                    <Textarea placeholder="Observações sobre o agendamento..." />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Button>Criar Agendamento</Button>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Criar e Enviar Confirmação
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{todayAppointments.length}</p>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {appointments.filter(apt => apt.status === 'confirmed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Confirmados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {appointments.filter(apt => apt.status === 'pending').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Send className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Enviados hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="today">Hoje</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendário - Janeiro 2024</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Visualização do Calendário</h3>
                  <p className="text-muted-foreground">
                    Componente de calendário será implementado aqui com integração FullCalendar
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(appointment.type)}
                          {getStatusIcon(appointment.status)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback>{appointment.contact.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{appointment.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {appointment.contact} • {appointment.phone}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              via {appointment.channel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-medium">
                          {new Date(appointment.date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.time} ({appointment.duration}min)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.location}
                        </p>
                        <div className="flex space-x-1 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendConfirmation(appointment)}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendReminder(appointment)}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Lembrete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="today">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos de Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-blue-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(appointment.type)}
                          {getStatusIcon(appointment.status)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{appointment.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {appointment.contact} • {appointment.time}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {appointment.notes}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Responsável: {appointment.agent}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
}