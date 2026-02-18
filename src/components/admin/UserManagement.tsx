import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleSelect } from "@/components/ui/simple-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Edit, UserCog, Shield, User } from "lucide-react";

interface UserProfile {
  id: string;
  nome_completo: string;
  email: string | null;
  matricula: string | null;
  telefone: string | null;
  unidade_gestora: string | null;
  unidade_lotacao: string | null;
  formacao: string | null;
  cargo: string | null;
  role: "admin" | "usuario_padrao";
  created_at: string;
}

const unidadesGestoras = [
  'SEDE NACIONAL/DF', 'UNIPRF/DF',
  'SPRF/AC', 'SPRF/AL', 'SPRF/AM', 'SPRF/AP', 'SPRF/BA', 'SPRF/CE',
  'SPRF/DF', 'SPRF/ES', 'SPRF/GO', 'SPRF/MA', 'SPRF/MG', 'SPRF/MS',
  'SPRF/MT', 'SPRF/PA', 'SPRF/PB', 'SPRF/PE', 'SPRF/PI', 'SPRF/PR',
  'SPRF/RJ', 'SPRF/RN', 'SPRF/RO', 'SPRF/RR', 'SPRF/RS', 'SPRF/SC',
  'SPRF/SE', 'SPRF/SP', 'SPRF/TO'
];

const opcoesFormacao = [
  'Arquitetura', 'Engenharia Civil', 'Engenharia Elétrica',
  'Engenharia Mecânica', 'Outra'
];

const roleOptions = ['admin', 'usuario_padrao'];

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("nome_completo");

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      nome_completo: user.nome_completo,
      matricula: user.matricula || "",
      unidade_gestora: user.unidade_gestora || "",
      unidade_lotacao: user.unidade_lotacao || "",
      telefone: user.telefone || "",
      formacao: user.formacao || "",
      cargo: user.cargo || "",
      role: user.role,
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          nome_completo: editForm.nome_completo,
          matricula: editForm.matricula || null,
          unidade_gestora: editForm.unidade_gestora || null,
          unidade_lotacao: editForm.unidade_lotacao || null,
          telefone: editForm.telefone || null,
          formacao: editForm.formacao || null,
          cargo: editForm.cargo || null,
          role: editForm.role as "admin" | "usuario_padrao",
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: `Perfil de ${editForm.nome_completo} atualizado com sucesso.`,
      });

      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.nome_completo?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.matricula?.toLowerCase().includes(term) ||
      user.unidade_gestora?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email, matrícula ou unidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Badge variant="outline" className="ml-auto">
          {filteredUsers.length} usuário(s)
        </Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Unidade Gestora</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome_completo}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.email || "—"}</TableCell>
                    <TableCell>{user.matricula || "—"}</TableCell>
                    <TableCell>{user.unidade_gestora || user.unidade_lotacao || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                        {user.role === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {user.role === "admin" ? "Admin" : "Padrão"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Editar Perfil do Usuário</DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={editForm.nome_completo || ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, nome_completo: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Matrícula</Label>
                <Input
                  value={editForm.matricula || ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, matricula: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={editForm.telefone || ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, telefone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Unidade Gestora</Label>
                <SimpleSelect
                  options={unidadesGestoras}
                  value={editForm.unidade_gestora || ""}
                  onChange={(v) => setEditForm((p) => ({ ...p, unidade_gestora: v, unidade_lotacao: v }))}
                  placeholder="Selecione"
                />
              </div>

              <div className="space-y-2">
                <Label>Formação</Label>
                <SimpleSelect
                  options={opcoesFormacao}
                  value={editForm.formacao || ""}
                  onChange={(v) => setEditForm((p) => ({ ...p, formacao: v }))}
                  placeholder="Selecione"
                />
              </div>

              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input
                  value={editForm.cargo || ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, cargo: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Perfil de Acesso</Label>
                <SimpleSelect
                  options={roleOptions}
                  value={editForm.role || "usuario_padrao"}
                  onChange={(v) => setEditForm((p) => ({ ...p, role: v as "admin" | "usuario_padrao" }))}
                  placeholder="Selecione o perfil"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || !editForm.nome_completo}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
