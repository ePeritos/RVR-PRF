
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnidadesGestoras } from '@/hooks/useUnidadesGestoras';
import { useResponsaveisTecnicos } from '@/hooks/useResponsaveisTecnicos';

interface Profile {
  nome_completo: string;
  cargo: string;
  matricula: string;
  unidade_lotacao: string;
  telefone: string;
  responsavel_tecnico_id?: string;
}

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  setProfile: (profile: Profile) => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
}

export const ProfileEditDialog = ({
  open,
  onOpenChange,
  profile,
  setProfile,
  onSave,
  loading
}: ProfileEditDialogProps) => {
  const { unidadesGestoras, loading: loadingUnidades } = useUnidadesGestoras();
  const { responsaveisTecnicos, loading: loadingResponsaveis } = useResponsaveisTecnicos();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perfil do Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_completo">Nome Completo</Label>
            <Input
              id="nome_completo"
              value={profile.nome_completo}
              onChange={(e) => setProfile({ ...profile, nome_completo: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              value={profile.cargo}
              onChange={(e) => setProfile({ ...profile, cargo: e.target.value })}
              placeholder="Ex: Engenheiro Civil"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="matricula">Matrícula</Label>
            <Input
              id="matricula"
              value={profile.matricula}
              onChange={(e) => setProfile({ ...profile, matricula: e.target.value })}
              placeholder="Ex: CREA/XX 123456"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unidade_lotacao">Unidade de Lotação</Label>
            <Select
              value={profile.unidade_lotacao}
              onValueChange={(value) => setProfile({ ...profile, unidade_lotacao: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingUnidades ? "Carregando..." : "Selecione uma unidade"} />
              </SelectTrigger>
              <SelectContent>
                {unidadesGestoras.map((unidade) => (
                  <SelectItem key={unidade} value={unidade}>
                    {unidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavel_tecnico_id">Responsável Técnico (Opcional)</Label>
            <Select
              value={profile.responsavel_tecnico_id}
              onValueChange={(value) => setProfile({ ...profile, responsavel_tecnico_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingResponsaveis ? "Carregando..." : "Selecione um responsável técnico"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum (usar dados do perfil)</SelectItem>
                {responsaveisTecnicos.map((responsavel) => (
                  <SelectItem key={responsavel.id} value={responsavel.id}>
                    {responsavel.nome_completo} - {responsavel.conselho}/{responsavel.uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={profile.telefone}
              onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
              placeholder="Ex: (11) 99999-9999"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
