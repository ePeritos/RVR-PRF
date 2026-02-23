import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Edit, Trash2, ShieldCheck, Search } from "lucide-react";

const MODULOS = [
  { key: "caip", label: "CAIP" },
  { key: "rvr", label: "RVR" },
  { key: "dashboard", label: "Dashboard" },
  { key: "relatorios", label: "Relatórios" },
];

const ACOES = [
  { key: "visualizar", label: "Visualizar" },
  { key: "editar", label: "Editar" },
  { key: "excluir", label: "Excluir" },
  { key: "exportar", label: "Exportar" },
];

const UNIDADES_GESTORAS = [
  'SEDE NACIONAL/DF', 'UNIPRF/DF',
  'SPRF/AC', 'SPRF/AL', 'SPRF/AM', 'SPRF/AP', 'SPRF/BA', 'SPRF/CE',
  'SPRF/DF', 'SPRF/ES', 'SPRF/GO', 'SPRF/MA', 'SPRF/MG', 'SPRF/MS',
  'SPRF/MT', 'SPRF/PA', 'SPRF/PB', 'SPRF/PE', 'SPRF/PI', 'SPRF/PR',
  'SPRF/RJ', 'SPRF/RN', 'SPRF/RO', 'SPRF/RR', 'SPRF/RS', 'SPRF/SC',
  'SPRF/SE', 'SPRF/SP', 'SPRF/TO'
];

interface PerfilPermissao {
  id: string;
  nome: string;
  descricao: string | null;
  unidades_gestoras: string[];
  created_at: string;
}

interface PermissaoAcao {
  modulo: string;
  acao: string;
  permitido: boolean;
}

export function PermissionsManagement() {
  const [perfis, setPerfis] = useState<PerfilPermissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState<PerfilPermissao | null>(null);
  const [deletePerfil, setDeletePerfil] = useState<PerfilPermissao | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formUnidades, setFormUnidades] = useState<string[]>([]);
  const [formAcoes, setFormAcoes] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  const fetchPerfis = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("perfis_permissao")
        .select("*")
        .order("nome");

      if (error) throw error;
      setPerfis((data || []) as PerfilPermissao[]);
    } catch (error: any) {
      toast({ title: "Erro ao carregar perfis", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfis();
  }, []);

  const initDefaultAcoes = (): Record<string, boolean> => {
    const acoes: Record<string, boolean> = {};
    MODULOS.forEach((m) => {
      ACOES.forEach((a) => {
        acoes[`${m.key}:${a.key}`] = false;
      });
    });
    return acoes;
  };

  const openCreateDialog = () => {
    setEditingPerfil(null);
    setFormNome("");
    setFormDescricao("");
    setFormUnidades([]);
    setFormAcoes(initDefaultAcoes());
    setDialogOpen(true);
  };

  const openEditDialog = async (perfil: PerfilPermissao) => {
    setEditingPerfil(perfil);
    setFormNome(perfil.nome);
    setFormDescricao(perfil.descricao || "");
    setFormUnidades(perfil.unidades_gestoras || []);

    // Fetch existing actions
    const acoes = initDefaultAcoes();
    try {
      const { data, error } = await supabase
        .from("perfil_permissao_acoes")
        .select("modulo, acao, permitido")
        .eq("perfil_permissao_id", perfil.id);

      if (error) throw error;
      (data || []).forEach((item: PermissaoAcao) => {
        acoes[`${item.modulo}:${item.acao}`] = item.permitido;
      });
    } catch (error: any) {
      toast({ title: "Erro ao carregar ações", description: error.message, variant: "destructive" });
    }
    setFormAcoes(acoes);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formNome.trim()) return;
    try {
      setSaving(true);

      let perfilId: string;

      if (editingPerfil) {
        const { error } = await supabase
          .from("perfis_permissao")
          .update({
            nome: formNome.trim(),
            descricao: formDescricao.trim() || null,
            unidades_gestoras: formUnidades,
          })
          .eq("id", editingPerfil.id);
        if (error) throw error;
        perfilId = editingPerfil.id;

        // Delete existing actions and re-insert
        await supabase
          .from("perfil_permissao_acoes")
          .delete()
          .eq("perfil_permissao_id", perfilId);
      } else {
        const { data, error } = await supabase
          .from("perfis_permissao")
          .insert({
            nome: formNome.trim(),
            descricao: formDescricao.trim() || null,
            unidades_gestoras: formUnidades,
          })
          .select("id")
          .single();
        if (error) throw error;
        perfilId = data.id;
      }

      // Insert actions
      const acoesInsert = Object.entries(formAcoes).map(([key, permitido]) => {
        const [modulo, acao] = key.split(":");
        return { perfil_permissao_id: perfilId, modulo, acao, permitido };
      });

      const { error: acoesError } = await supabase
        .from("perfil_permissao_acoes")
        .insert(acoesInsert);
      if (acoesError) throw acoesError;

      toast({
        title: editingPerfil ? "Perfil atualizado" : "Perfil criado",
        description: `Perfil "${formNome}" salvo com sucesso.`,
      });
      setDialogOpen(false);
      fetchPerfis();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePerfil) return;
    try {
      setDeleting(true);
      const { error } = await supabase
        .from("perfis_permissao")
        .delete()
        .eq("id", deletePerfil.id);
      if (error) throw error;
      toast({ title: "Perfil excluído", description: `Perfil "${deletePerfil.nome}" removido.` });
      setDeletePerfil(null);
      fetchPerfis();
    } catch (error: any) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const toggleAcao = (key: string) => {
    setFormAcoes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleModulo = (moduloKey: string) => {
    const allEnabled = ACOES.every((a) => formAcoes[`${moduloKey}:${a.key}`]);
    setFormAcoes((prev) => {
      const updated = { ...prev };
      ACOES.forEach((a) => {
        updated[`${moduloKey}:${a.key}`] = !allEnabled;
      });
      return updated;
    });
  };

  const filteredPerfis = perfis.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar perfis de permissão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Perfil
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredPerfis.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhum perfil de permissão criado ainda.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie perfis para definir quais ações cada grupo de usuários pode realizar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Unidades Gestoras</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPerfis.map((perfil) => (
                <TableRow key={perfil.id}>
                  <TableCell className="font-medium">{perfil.nome}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{perfil.descricao || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(perfil.unidades_gestoras || []).length === 0 ? (
                        <Badge variant="outline" className="text-xs">Todas</Badge>
                      ) : (
                        (perfil.unidades_gestoras || []).slice(0, 3).map((u) => (
                          <Badge key={u} variant="secondary" className="text-xs">{u}</Badge>
                        ))
                      )}
                      {(perfil.unidades_gestoras || []).length > 3 && (
                        <Badge variant="outline" className="text-xs">+{perfil.unidades_gestoras.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(perfil)} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletePerfil(perfil)} title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPerfil ? "Editar Perfil de Permissão" : "Novo Perfil de Permissão"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Nome do Perfil *</Label>
                <Input
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: Gestor Regional, Técnico de Campo"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Descreva as responsabilidades deste perfil..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Unidades Gestoras (deixe vazio para todas)</Label>
                <MultiSelect
                  options={UNIDADES_GESTORAS}
                  selected={formUnidades}
                  onChange={setFormUnidades}
                  placeholder="Selecione as unidades..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Permissões por Módulo</Label>
              <div className="space-y-3">
                {MODULOS.map((modulo) => {
                  const allEnabled = ACOES.every((a) => formAcoes[`${modulo.key}:${a.key}`]);
                  return (
                    <Card key={modulo.key}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">{modulo.label}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleModulo(modulo.key)}
                            className="text-xs h-7"
                          >
                            {allEnabled ? "Desmarcar todos" : "Marcar todos"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {ACOES.map((acao) => {
                            const key = `${modulo.key}:${acao.key}`;
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <Switch
                                  checked={formAcoes[key] || false}
                                  onCheckedChange={() => toggleAcao(key)}
                                  id={key}
                                />
                                <Label htmlFor={key} className="text-sm cursor-pointer">
                                  {acao.label}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !formNome.trim()}>
                {saving ? "Salvando..." : editingPerfil ? "Salvar Alterações" : "Criar Perfil"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePerfil} onOpenChange={(open) => !open && setDeletePerfil(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir perfil de permissão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o perfil <strong>{deletePerfil?.nome}</strong>? Usuários vinculados perderão este perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
