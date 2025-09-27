import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOff,
  Volume2,
  VolumeX,
  Users,
  Calendar,
  Clock,
  Filter,
  Search,
  Play,
  Pause,
  RotateCcw,
  Download,
  MessageSquare,
  Settings,
  Monitor,
  Share
} from 'lucide-react';

interface Call {
  id: string;
  type: 'video' | 'audio';
  status: 'active' | 'ringing' | 'ended' | 'missed';
  contact: {
    name: string;
    phone: string;
    avatar?: string;
  };
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  recording?: string;
  notes?: string;
}

interface CallSession {
  id: string;
  isActive: boolean;
  type: 'video' | 'audio';
  contact: Call['contact'];
  startTime: Date;
  localVideo: boolean;
  remoteVideo: boolean;
  localAudio: boolean;
  remoteAudio: boolean;
  isRecording: boolean;
}

const mockCalls: Call[] = [
  {
    id: '1',
    type: 'video',
    status: 'ended',
    contact: { name: 'João Silva', phone: '+55 11 99999-9999', avatar: '/avatars/01.png' },
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(Date.now() - 3300000),
    duration: 300,
    recording: 'call_1_recording.mp4',
    notes: 'Reunião sobre projeto X'
  },
  {
    id: '2',
    type: 'audio',
    status: 'ended',
    contact: { name: 'Maria Santos', phone: '+55 11 88888-8888' },
    startTime: new Date(Date.now() - 7200000),
    endTime: new Date(Date.now() - 6900000),
    duration: 180,
    notes: 'Suporte técnico resolvido'
  },
  {
    id: '3',
    type: 'video',
    status: 'missed',
    contact: { name: 'Pedro Costa', phone: '+55 11 77777-7777' },
    startTime: new Date(Date.now() - 1800000),
  }
];

const Chamadas: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>(mockCalls);
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callNumber, setCallNumber] = useState('');
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.contact.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || call.status === filterStatus;
    const matchesType = filterType === 'all' || call.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const startCall = (type: 'video' | 'audio', contact?: Call['contact']) => {
    if (currentCall) {
      toast.error('Já há uma chamada em andamento');
      return;
    }

    const callContact = contact || {
      name: 'Contato Desconhecido',
      phone: callNumber
    };

    const newCall: CallSession = {
      id: Date.now().toString(),
      isActive: true,
      type,
      contact: callContact,
      startTime: new Date(),
      localVideo: type === 'video',
      remoteVideo: type === 'video',
      localAudio: true,
      remoteAudio: true,
      isRecording: isRecordingEnabled
    };

    setCurrentCall(newCall);
    
    // Simular início da mídia
    navigator.mediaDevices.getUserMedia({ 
      video: type === 'video', 
      audio: true 
    }).then(stream => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }).catch(err => {
      console.error('Erro ao acessar mídia:', err);
      toast.error('Erro ao acessar câmera/microfone');
    });

    toast.success(`Chamada ${type === 'video' ? 'de vídeo' : 'de áudio'} iniciada`);
  };

  const endCall = () => {
    if (!currentCall) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - currentCall.startTime.getTime()) / 1000);

    const completedCall: Call = {
      id: currentCall.id,
      type: currentCall.type,
      status: 'ended',
      contact: currentCall.contact,
      startTime: currentCall.startTime,
      endTime,
      duration,
      recording: currentCall.isRecording ? `call_${currentCall.id}_recording.mp4` : undefined
    };

    setCalls(prev => [completedCall, ...prev]);
    setCurrentCall(null);
    
    // Parar streams de mídia
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    toast.success('Chamada encerrada');
  };

  const toggleVideo = () => {
    if (!currentCall) return;
    
    setCurrentCall(prev => prev ? {
      ...prev,
      localVideo: !prev.localVideo
    } : null);
  };

  const toggleAudio = () => {
    if (!currentCall) return;
    
    setCurrentCall(prev => prev ? {
      ...prev,
      localAudio: !prev.localAudio
    } : null);
  };

  const toggleRecording = () => {
    if (!currentCall) return;
    
    setCurrentCall(prev => prev ? {
      ...prev,
      isRecording: !prev.isRecording
    } : null);
    
    toast.success(currentCall.isRecording ? 'Gravação pausada' : 'Gravação iniciada');
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (date: Date): string => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Call['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'ended': return 'bg-blue-500';
      case 'missed': return 'bg-red-500';
      case 'ringing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Call['status']) => {
    switch (status) {
      case 'active': return 'Em andamento';
      case 'ended': return 'Finalizada';
      case 'missed': return 'Perdida';
      case 'ringing': return 'Tocando';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Chamadas</h1>
            <p className="text-muted-foreground">Gerencie chamadas de vídeo e áudio</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isCallModalOpen} onOpenChange={setIsCallModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Phone className="h-4 w-4 mr-2" />
                  Nova Chamada
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Iniciar Nova Chamada</DialogTitle>
                  <DialogDescription>
                    Digite o número ou selecione um contato para iniciar a chamada
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Número de Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="+55 11 99999-9999"
                      value={callNumber}
                      onChange={(e) => setCallNumber(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        startCall('audio');
                        setIsCallModalOpen(false);
                        setCallNumber('');
                      }}
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Chamada de Áudio
                    </Button>
                    <Button 
                      onClick={() => {
                        startCall('video');
                        setIsCallModalOpen(false);
                        setCallNumber('');
                      }}
                      className="flex-1"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Chamada de Vídeo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Chamada Ativa */}
        <AnimatePresence>
          {currentCall && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            >
              <Card className="w-full max-w-4xl mx-4 bg-black/50 border-white/20">
                <CardHeader className="text-center text-white">
                  <CardTitle className="text-2xl">{currentCall.contact.name}</CardTitle>
                  <CardDescription className="text-white/70">
                    {currentCall.contact.phone}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Vídeo */}
                  {currentCall.type === 'video' && (
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        ref={remoteVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                      />
                      <div className="absolute bottom-4 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden">
                        <video
                          ref={localVideoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          playsInline
                          muted
                        />
                      </div>
                    </div>
                  )}

                  {/* Controles */}
                  <div className="flex justify-center items-center gap-4">
                    <Button
                      size="lg"
                      variant={currentCall.localAudio ? "default" : "destructive"}
                      onClick={toggleAudio}
                      className="rounded-full w-12 h-12"
                    >
                      {currentCall.localAudio ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                    </Button>
                    
                    {currentCall.type === 'video' && (
                      <Button
                        size="lg"
                        variant={currentCall.localVideo ? "default" : "destructive"}
                        onClick={toggleVideo}
                        className="rounded-full w-12 h-12"
                      >
                        {currentCall.localVideo ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                      </Button>
                    )}
                    
                    <Button
                      size="lg"
                      variant={currentCall.isRecording ? "destructive" : "secondary"}
                      onClick={toggleRecording}
                      className="rounded-full w-12 h-12"
                    >
                      {currentCall.isRecording ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={endCall}
                      className="rounded-full w-12 h-12"
                    >
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Info da chamada */}
                  <div className="text-center text-white/70">
                    <p>Duração: {formatDuration(Math.floor((Date.now() - currentCall.startTime.getTime()) / 1000))}</p>
                    {currentCall.isRecording && (
                      <p className="text-red-400 flex items-center justify-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        Gravando
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Chamadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por nome ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="ended">Finalizadas</SelectItem>
                  <SelectItem value="missed">Perdidas</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="audio">Áudio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Chamadas */}
            <div className="space-y-4">
              {filteredCalls.map((call) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={call.contact.avatar} alt={call.contact.name} />
                    <AvatarFallback>{call.contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{call.contact.name}</h3>
                      <Badge variant="secondary" className={`${getStatusColor(call.status)} text-white`}>
                        {getStatusText(call.status)}
                      </Badge>
                      {call.type === 'video' ? (
                        <Video className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{call.contact.phone}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {call.startTime && formatCallTime(call.startTime)}
                      </span>
                      {call.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(call.duration)}
                        </span>
                      )}
                    </div>
                    {call.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{call.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {call.recording && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startCall(call.type, call.contact)}
                      disabled={!!currentCall}
                    >
                      <PhoneCall className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredCalls.length === 0 && (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Nenhuma chamada encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Inicie sua primeira chamada usando o botão acima'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Chamadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Gravação Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Gravar automaticamente todas as chamadas
                </p>
              </div>
              <Switch
                checked={isRecordingEnabled}
                onCheckedChange={setIsRecordingEnabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações de chamadas perdidas
                </p>
              </div>
              <Switch
                checked={isNotificationsEnabled}
                onCheckedChange={setIsNotificationsEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Chamadas;