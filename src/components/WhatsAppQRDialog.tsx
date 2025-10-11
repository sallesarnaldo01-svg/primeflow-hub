import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { whatsappService } from '@/services/whatsapp';
import { toast } from 'sonner';

interface WhatsAppQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId?: string;
  onConnected?: () => void;
}

export function WhatsAppQRDialog({
  open,
  onOpenChange,
  connectionId,
  onConnected,
}: WhatsAppQRDialogProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'qr' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (open && connectionId) {
      loadQRCode();
      
      // Poll for status
      const interval = setInterval(checkStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [open, connectionId]);

  const loadQRCode = async () => {
    if (!connectionId) return;
    
    try {
      setStatus('loading');
      const data = await whatsappService.getQRCode(connectionId);
      
      if (data.status === 'CONNECTED') {
        setStatus('connected');
        toast.success('WhatsApp conectado!');
        onConnected?.();
        setTimeout(() => onOpenChange(false), 2000);
      } else {
        setQrCode(data.qrCode);
        setStatus('qr');
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Erro ao carregar QR Code');
      toast.error('Erro ao carregar QR Code');
    }
  };

  const checkStatus = async () => {
    if (!connectionId) return;
    
    try {
      const data = await whatsappService.getConnectionStatus(connectionId);
      
      if (data.status === 'CONNECTED') {
        setStatus('connected');
        toast.success('WhatsApp conectado!');
        onConnected?.();
        setTimeout(() => onOpenChange(false), 2000);
      }
    } catch (error) {
      // Ignore polling errors
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com seu WhatsApp para conectar
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Gerando QR Code...
              </p>
            </div>
          )}

          {status === 'qr' && qrCode && (
            <>
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-primary/20">
                <img
                  src={qrCode}
                  alt="QR Code WhatsApp"
                  className="w-72 h-72 object-contain"
                />
              </div>
              <Alert className="bg-primary/5 border-primary/20">
                <AlertDescription className="space-y-2">
                  <p className="font-semibold text-primary">Como conectar:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Abra o WhatsApp no seu celular</li>
                    <li>Toque em <strong>Menu</strong> (⋮) → <strong>Aparelhos conectados</strong></li>
                    <li>Toque em <strong>Conectar um aparelho</strong></li>
                    <li>Aponte a câmera do celular para o QR Code acima</li>
                  </ol>
                </AlertDescription>
              </Alert>
              <Button onClick={loadQRCode} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar QR Code
              </Button>
            </>
          )}

          {status === 'connected' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
              <p className="text-lg font-semibold text-green-600">
                Conectado com sucesso!
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-16 w-16 text-red-600" />
              <p className="text-sm text-red-600">{errorMessage}</p>
              <Button onClick={loadQRCode} variant="outline">
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
