
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfile } from '@/hooks/useProfile';
import { useUnidadesGestoras } from '@/hooks/useUnidadesGestoras';
import { useResponsaveisTecnicos } from '@/hooks/useResponsaveisTecnicos';
import { User, Save } from 'lucide-react';
import { Header } from '@/components/Header';

const Profile = () => {
  const { profile, setProfile, loading, saveProfile } = useProfile();
  const { unidadesGestoras, loading: loadingUnidades } = useUnidadesGestoras();
  const { responsaveisTecnicos, loading: loadingResponsaveis } = useResponsaveisTecnicos();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile(profile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-4 border-b">
        <Header />
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
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
                
                <Button type="submit" disabled={loading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Salvando..." : "Salvar Perfil"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
