import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, Phone } from 'lucide-react';
import { videoCallService, VideoCallRoom } from '@/services/videoCall';
import { toast } from 'sonner';

interface VideoCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  topic: string;
  participants: string[];
}

export function VideoCallDialog({
  open,
  onOpenChange,
  teamId,
  topic,
  participants
}: VideoCallDialogProps) {
  const [room, setRoom] = useState<VideoCallRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    if (open && !room) {
      initializeCall();
    }
  }, [open]);

  const initializeCall = async () => {
    try {
      setLoading(true);
      const callRoom = await videoCallService.createRoom(teamId, topic, participants);
      setRoom(callRoom);
      setInCall(true);
    } catch (error) {
      toast.error('Erro ao iniciar chamada');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const endCall = async () => {
    if (room) {
      try {
        await videoCallService.endCall(room.id);
        setInCall(false);
        onOpenChange(false);
        toast.success('Chamada encerrada');
      } catch (error) {
        toast.error('Erro ao encerrar chamada');
      }
    }
  };

  const joinJitsi = () => {
    if (room) {
      window.open(room.jitsiUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {topic}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          {loading && (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Iniciando chamada...</p>
              </div>
            </div>
          )}

          {room && inCall && (
            <>
              <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Video className="h-16 w-16 mx-auto text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">Sala de Reunião Pronta</h3>
                    <p className="text-sm text-muted-foreground">
                      {participants.length} participante(s) convidado(s)
                    </p>
                  </div>
                  <Button onClick={joinJitsi} size="lg">
                    Entrar na Chamada
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="icon">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={endCall}>
                  <Phone className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-xs text-center text-muted-foreground">
                Room ID: {room.roomId}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
