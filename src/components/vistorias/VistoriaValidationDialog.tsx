import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VISTORIA_SECTIONS, SECTION_STATUS_OPTIONS, VISTORIA_STATUS_LABELS } from '@/constants/vistoriaConstants';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface VistoriaValidationDialogProps {
  vistoria: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Validacao {
  secao: string;
  campo: string;
  status: string;
  observacao_validador: string;
}

export function VistoriaValidationDialog({ vistoria, open, onOpenChange, onSuccess }: VistoriaValidationDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [validacoes, setValidacoes] = useState<Record<string, Validacao>>({});
  const [saving, setSaving] = useState(false);
  const [existingValidacoes, setExistingValidacoes] = useState<any[]>([]);
  const [caipRecords, setCaipRecords] = useState<{ id: string; ano_caip: string; nome_da_unidade: string }[]>([]);
  const [selectedCaipId, setSelectedCaipId] = useState<string>('');

  useEffect(() => {
    if (open && vistoria?.id) {
      fetchValidacoes();
      fetchCaipRecords();
    }
  }, [open, vistoria?.id]);

  const fetchValidacoes = async () => {
    const { data } = await supabase
      .from('vistoria_validacoes')
      .select('*')
      .eq('vistoria_id', vistoria.id);
    
    if (data) {
      setExistingValidacoes(data);
      const map: Record<string, Validacao> = {};
      data.forEach((v: any) => {
        map[`${v.secao}__${v.campo}`] = {
          secao: v.secao,
          campo: v.campo,
          status: v.status,
          observacao_validador: v.observacao_validador || '',
        };
      });
      setValidacoes(map);
    }
  };

  const fetchCaipRecords = async () => {
    const { data: currentCaip } = await supabase
      .from('dados_caip')
      .select('id, ano_caip, nome_da_unidade')
      .eq('id', vistoria.dados_caip_id)
      .single();

    if (!currentCaip?.nome_da_unidade) {
      setCaipRecords(currentCaip ? [{ id: currentCaip.id, ano_caip: currentCaip.ano_caip || '—', nome_da_unidade: currentCaip.nome_da_unidade || '—' }] : []);
      setSelectedCaipId(vistoria.dados_caip_id);
      return;
    }

    const { data } = await supabase
      .from('dados_caip')
      .select('id, ano_caip, nome_da_unidade')
      .eq('nome_da_unidade', currentCaip.nome_da_unidade)
      .order('ano_caip', { ascending: false });

    if (data && data.length > 0) {
      setCaipRecords(data.map(r => ({ id: r.id, ano_caip: r.ano_caip || '—', nome_da_unidade: r.nome_da_unidade || '—' })));
      setSelectedCaipId(vistoria.dados_caip_id);
    }
  };


    const key = `${secao}__${campo}`;
    setValidacoes(prev => ({
      ...prev,
      [key]: { secao, campo, status, observacao_validador: prev[key]?.observacao_validador || '' }
    }));
  };

  const setFieldObs = (secao: string, campo: string, obs: string) => {
    const key = `${secao}__${campo}`;
    setValidacoes(prev => ({
      ...prev,
      [key]: { ...prev[key], secao, campo, observacao_validador: obs }
    }));
  };

  const getFieldStatus = (secao: string, campo: string) => {
    return validacoes[`${secao}__${campo}`]?.status || 'pendente';
  };

  const handleSaveValidations = async () => {
    if (!user) return;
    try {
      setSaving(true);

      const upserts = Object.values(validacoes).map(v => ({
        vistoria_id: vistoria.id,
        secao: v.secao,
        campo: v.campo,
        status: v.status,
        observacao_validador: v.observacao_validador || null,
        validado_por: user.id,
        validado_em: new Date().toISOString(),
      }));

      if (upserts.length > 0) {
        const { error } = await supabase
          .from('vistoria_validacoes')
          .upsert(upserts as any, { onConflict: 'vistoria_id,secao,campo' });
        if (error) throw error;
      }

      toast({ title: 'Validações salvas', description: 'As validações foram registradas.' });
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const copyImagesToCAIP = async () => {
    const imageFields = [
      'imagem_geral', 'imagem_fachada', 'imagem_lateral_1', 'imagem_lateral_2',
      'imagem_fundos', 'imagem_sala_cofre', 'imagem_cofre',
      'imagem_interna_alojamento_masculino', 'imagem_interna_alojamento_feminino',
      'imagem_interna_plantao_uop',
    ] as const;

    const updateData: Record<string, string> = {};
    for (const field of imageFields) {
      const value = vistoria[field];
      if (value && typeof value === 'string' && value.trim() !== '') {
        updateData[field] = value;
      }
    }

    if (Object.keys(updateData).length === 0) return 0;

    const { error } = await supabase
      .from('dados_caip')
      .update(updateData)
      .eq('id', vistoria.dados_caip_id);

    if (error) throw error;
    return Object.keys(updateData).length;
  };

  const handleFinalizeValidation = async (approved: boolean) => {
    if (!user) return;
    try {
      setSaving(true);

      // Save validations first
      await handleSaveValidations();

      // Update vistoria status
      const { error } = await supabase
        .from('vistorias_manutencao')
        .update({
          status: approved ? 'validado' : 'rejeitado',
          data_validacao: new Date().toISOString(),
        })
        .eq('id', vistoria.id);

      if (error) throw error;

      // Copy images to CAIP on approval
      let imagesCopied = 0;
      if (approved) {
        try {
          imagesCopied = await copyImagesToCAIP();
        } catch (imgError: any) {
          console.error('Erro ao copiar imagens para CAIP:', imgError);
          toast({ title: 'Aviso', description: 'Vistoria aprovada, mas houve erro ao copiar imagens para o CAIP.', variant: 'destructive' });
        }
      }

      toast({
        title: approved ? 'Vistoria aprovada' : 'Vistoria rejeitada',
        description: approved
          ? `A vistoria foi validada com sucesso.${imagesCopied > 0 ? ` ${imagesCopied} imagem(ns) copiada(s) para o CAIP.` : ''}`
          : 'A vistoria foi rejeitada. O terceirizado poderá corrigir.',
      });
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const sectionDbKey = (sectionId: string) => `secao_${sectionId}`;

  const StatusButton = ({ secao, campo }: { secao: string; campo: string }) => {
    const status = getFieldStatus(secao, campo);
    return (
      <div className="flex items-center gap-1">
        <Button
          variant={status === 'aprovado' ? 'default' : 'outline'}
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setFieldValidation(secao, campo, 'aprovado')}
          title="Aprovar"
        >
          <CheckCircle className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={status === 'rejeitado' ? 'destructive' : 'outline'}
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setFieldValidation(secao, campo, 'rejeitado')}
          title="Rejeitar"
        >
          <XCircle className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  };

  const canValidate = vistoria.status === 'enviado';
  const statusInfo = VISTORIA_STATUS_LABELS[vistoria.status] || VISTORIA_STATUS_LABELS.pendente;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Validação - {vistoria.dados_caip?.nome_da_unidade || 'Imóvel'}
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Info card */}
          <Card>
            <CardContent className="p-4 grid grid-cols-2 gap-2 text-sm">
              <div><strong>Responsável Técnico:</strong> {vistoria.responsavel_tecnico || '—'}</div>
              <div><strong>CREA/CAU:</strong> {vistoria.crea_cau || '—'}</div>
              <div><strong>Classificação:</strong> {vistoria.classificacao_geral || '—'}</div>
              <div><strong>Prazo adequação:</strong> {vistoria.prazo_adequacao_dias ? `${vistoria.prazo_adequacao_dias} dias` : '—'}</div>
            </CardContent>
          </Card>

          {/* Sections for validation */}
          <Accordion type="multiple" className="space-y-2">
            {VISTORIA_SECTIONS.map((section) => {
              const data = (vistoria as any)[sectionDbKey(section.id)];
              const sectionStatus = data?.status;
              const items = data?.items || {};

              const allItems = section.subsections
                ? section.subsections.flatMap(s => s.items)
                : section.items || [];

              return (
                <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span>{section.icon}</span>
                      <span className="font-semibold">{section.title}</span>
                      {sectionStatus && (
                        <Badge variant="outline">
                          {SECTION_STATUS_OPTIONS.find(o => o.value === sectionStatus)?.label || sectionStatus}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    {section.subsections ? (
                      section.subsections.map(sub => (
                        <div key={sub.title} className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground">{sub.title}</h4>
                          {sub.items.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-2 ml-2 py-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={items[item.id] ? 'default' : 'outline'} className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                                  {items[item.id] ? '✓' : '✗'}
                                </Badge>
                                <span className="text-sm">{item.label}</span>
                              </div>
                              {canValidate && <StatusButton secao={section.id} campo={item.id} />}
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      section.items?.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-2 py-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={items[item.id] ? 'default' : 'outline'} className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {items[item.id] ? '✓' : '✗'}
                            </Badge>
                            <span className="text-sm">{item.label}</span>
                          </div>
                          {canValidate && <StatusButton secao={section.id} campo={item.id} />}
                        </div>
                      ))
                    )}

                    {/* Section-level validation obs */}
                    {canValidate && (
                      <div className="space-y-2 pt-2 border-t">
                        <Label className="text-xs">Observação do validador para esta seção</Label>
                        <Textarea
                          value={validacoes[`${section.id}__secao_status`]?.observacao_validador || ''}
                          onChange={(e) => setFieldObs(section.id, 'secao_status', e.target.value)}
                          rows={2}
                          placeholder="Observações..."
                        />
                      </div>
                    )}

                    {data?.observacoes && (
                      <div className="p-2 bg-muted rounded text-sm">
                        <strong>Obs. do técnico:</strong> {data.observacoes}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Necessidades */}
          {vistoria.necessidades_iniciais && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Necessidades Iniciais</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{vistoria.necessidades_iniciais}</p></CardContent>
            </Card>
          )}

          {/* Actions */}
          {canValidate && (
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
              <Button variant="secondary" onClick={handleSaveValidations} disabled={saving}>
                Salvar Validações
              </Button>
              <Button variant="destructive" onClick={() => handleFinalizeValidation(false)} disabled={saving}>
                Rejeitar Vistoria
              </Button>
              <Button onClick={() => handleFinalizeValidation(true)} disabled={saving}>
                Aprovar Vistoria
              </Button>
            </div>
          )}

          {!canValidate && (
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
