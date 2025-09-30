import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Camera, Save, Lock } from 'lucide-react';

interface ProfileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'profile' | 'avatar' | 'password';
}

export function ProfileMenu({ open, onOpenChange, mode }: ProfileMenuProps) {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProfileSave = async () => {
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar chamada real à API
      // await api.put('/auth/profile', { name });
      
      updateUser({ name });
      toast.success('Perfil atualizado com sucesso');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSave = async () => {
    if (!avatarFile) {
      toast.error('Selecione uma foto');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar upload real
      // const formData = new FormData();
      // formData.append('avatar', avatarFile);
      // await api.put('/auth/avatar', formData);

      updateUser({ avatar: previewUrl || undefined });
      toast.success('Foto atualizada com sucesso');
      onOpenChange(false);
      setAvatarFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast.error('Erro ao atualizar foto');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Nova senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implementar chamada real à API
      // await api.post('/auth/reset-password', { currentPassword, newPassword });

      toast.success('Senha alterada com sucesso');
      onOpenChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {mode === 'profile' && (
          <>
            <DialogHeader>
              <DialogTitle>Meu Perfil</DialogTitle>
              <DialogDescription>
                Atualize suas informações pessoais
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O e-mail não pode ser alterado
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleProfileSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </>
        )}

        {mode === 'avatar' && (
          <>
            <DialogHeader>
              <DialogTitle>Trocar Foto</DialogTitle>
              <DialogDescription>
                Envie uma nova foto de perfil (máximo 5MB)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={previewUrl || user?.avatar} />
                  <AvatarFallback className="text-2xl">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Camera className="w-4 h-4 mr-2" />
                      Selecionar Foto
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAvatarSave} disabled={loading || !avatarFile}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </>
        )}

        {mode === 'password' && (
          <>
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
              <DialogDescription>
                Digite sua senha atual e a nova senha
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handlePasswordSave} disabled={loading}>
                <Lock className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
