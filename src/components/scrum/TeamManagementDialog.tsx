import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Trash2 } from 'lucide-react';
import type { ScrumTeam } from '@/services/scrum';

interface TeamManagementDialogProps {
  onCreateTeam: (team: Omit<ScrumTeam, 'id' | 'createdAt'>) => void;
}

export function TeamManagementDialog({ onCreateTeam }: TeamManagementDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<Array<{ userId: string; role: string; name: string }>>([]);
  const [newMember, setNewMember] = useState({ name: '', role: 'DEVELOPER' });

  const handleAddMember = () => {
    if (newMember.name) {
      setMembers([...members, { userId: `user-${Date.now()}`, ...newMember }]);
      setNewMember({ name: '', role: 'DEVELOPER' });
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onCreateTeam({
        name,
        description: description || undefined,
        members: members.map(m => ({
          id: m.userId,
          userId: m.userId,
          name: m.name,
          email: `${m.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
          role: m.role,
        })),
      });
      setName('');
      setDescription('');
      setMembers([]);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Gerenciar Times
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Time</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="team-name">Nome do Time</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Squad Alpha"
              required
            />
          </div>
          <div>
            <Label htmlFor="team-description">Descrição</Label>
            <Textarea
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do time..."
            />
          </div>

          <div className="space-y-3">
            <Label>Membros do Time</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nome do membro"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
              <select
                className="px-3 py-2 border rounded-md"
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              >
                <option value="SCRUM_MASTER">Scrum Master</option>
                <option value="PRODUCT_OWNER">Product Owner</option>
                <option value="DEVELOPER">Developer</option>
              </select>
              <Button type="button" onClick={handleAddMember}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {members.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({member.role})</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Time</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
