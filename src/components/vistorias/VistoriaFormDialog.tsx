import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SimpleSelect } from '@/components/ui/simple-select';
import { VISTORIA_SECTIONS, SECTION_STATUS_OPTIONS } from '@/constants/vistoriaConstants';
import { ImagesSection } from '@/components/caip/ImagesSection';
import { Send, Save } from 'lucide-react';

interface VistoriaFormDialogProps {
  vistoria: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VistoriaFormDialog({ vistoria, open, onOpenChange, onSuccess }: VistoriaFormDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    responsavel_tecnico: vistoria.responsavel_tecnico || '',
    crea_cau: vistoria.crea_cau || '',
    acompanhamento_fiscalizacao: vistoria.acompanhamento_fiscalizacao || false,
    classificacao_geral: vistoria.classificacao_geral || '',
    prazo_adequacao_dias: vistoria.prazo_adequacao_dias || '',
    necessidades_iniciais: vistoria.necessidades_iniciais || '',
    observacoes_gerais: vistoria.observacoes_gerais || '',
  });

  // Section data: { [sectionId]: { status: string, items: { [itemId]: boolean }, observacoes: string } }
  const [sectionData, setSectionData] = useState<Record<string, any>>({});

  // Image data
  const [imageValues, setImageValues] = useState<Record<string, string | null>>({});

  useEffect(() => {
    // Initialize section data from vistoria
    const sections: Record<string, any> = {};
    VISTORIA_SECTIONS.forEach(section => {
      const dbKey = `secao_${section.id}` as string;
      const existing = (vistoria as any)[dbKey];
      sections[section.id] = existing && typeof existing === 'object' && Object.keys(existing).length > 0
        ? existing
        : { status: '', items: {}, observacoes: '' };
    });
    setSectionData(sections);

    // Initialize images
    const imgs: Record<string, string | null> = {};
    const imageFields = [
      'imagem_geral', 'imagem_fachada', 'imagem_lateral_1', 'imagem_lateral_2',
      'imagem_fundos', 'imagem_sala_cofre', 'imagem_cofre',
      'imagem_interna_alojamento_masculino', 'imagem_interna_alojamento_feminino',
      'imagem_interna_plantao_uop'
    ];
    imageFields.forEach(f => { imgs[f] = vistoria[f] || null; });
    setImageValues(imgs);
  }, [vistoria]);

  const updateSectionItem = (sectionId: string, itemId: string, checked: boolean) => {
    setSectionData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        items: { ...prev[sectionId]?.items, [itemId]: checked }
      }
    }));
  };

  const updateSectionStatus = (sectionId: string, status: string) => {
    setSectionData(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], status }
    }));
  };

  const updateSectionObs = (sectionId: string, obs: string) => {
    setSectionData(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], observacoes: obs }
    }));
  };

  const handleSave = async (send = false) => {
    try {
      setSaving(true);

      const updateData: any = {
        responsavel_tecnico: formData.responsavel_tecnico,
        crea_cau: formData.crea_cau,
        acompanhamento_fiscalizacao: formData.acompanhamento_fiscalizacao,
        classificacao_geral: formData.classificacao_geral || null,
        prazo_adequacao_dias: formData.prazo_adequacao_dias ? Number(formData.prazo_adequacao_dias) : null,
        necessidades_iniciais: formData.necessidades_iniciais || null,
        observacoes_gerais: formData.observacoes_gerais || null,
        ...imageValues,
      };

      // Add section data
      VISTORIA_SECTIONS.forEach(section => {
        updateData[`secao_${section.id}`] = sectionData[section.id] || {};
      });

      if (send) {
        updateData.status = 'enviado';
        updateData.data_envio = new Date().toISOString();
      } else if (vistoria.status === 'pendente') {
        updateData.status = 'em_andamento';
      }

      const { error } = await supabase
        .from('vistorias_manutencao')
        .update(updateData)
        .eq('id', vistoria.id);

      if (error) throw error;

      toast({
        title: send ? 'Vistoria enviada' : 'Vistoria salva',
        description: send ? 'A vistoria foi enviada para validação.' : 'Rascunho salvo com sucesso.',
      });
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = ['enviado', 'validado'].includes(vistoria.status);

  const getAllItems = (section: typeof VISTORIA_SECTIONS[0]) => {
    if (section.items) return section.items;
    return section.subsections?.flatMap(s => s.items) || [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Checklist de Vistoria - {vistoria.dados_caip?.nome_da_unidade || 'Imóvel'}
            <Badge variant={isReadOnly ? 'secondary' : 'outline'}>
              {isReadOnly ? 'Somente Leitura' : 'Editável'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Seção 1 - Identificação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Identificação da Unidade</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Responsável Técnico</Label>
                <Input
                  value={formData.responsavel_tecnico}
                  onChange={(e) => setFormData(p => ({ ...p, responsavel_tecnico: e.target.value }))}
                  disabled={isReadOnly}
                  placeholder="Nome do responsável técnico"
                />
              </div>
              <div className="space-y-2">
                <Label>CREA/CAU</Label>
                <Input
                  value={formData.crea_cau}
                  onChange={(e) => setFormData(p => ({ ...p, crea_cau: e.target.value }))}
                  disabled={isReadOnly}
                  placeholder="Número do registro"
                />
              </div>
              <div className="flex items-center gap-2 col-span-full">
                <Checkbox
                  checked={formData.acompanhamento_fiscalizacao}
                  onCheckedChange={(checked) => setFormData(p => ({ ...p, acompanhamento_fiscalizacao: !!checked }))}
                  disabled={isReadOnly}
                />
                <Label>Acompanhamento da fiscalização</Label>
              </div>
            </CardContent>
          </Card>

          {/* Seções do Checklist */}
          <Accordion type="multiple" className="space-y-2">
            {VISTORIA_SECTIONS.map((section) => (
              <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span>{section.icon}</span>
                    <span className="font-semibold">{section.title}</span>
                    {sectionData[section.id]?.status && (
                      <Badge variant="outline" className="ml-2">
                        {SECTION_STATUS_OPTIONS.find(o => o.value === sectionData[section.id].status)?.label}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {/* Status da seção */}
                  <div className="space-y-2">
                    <Label>Status da Seção</Label>
                    <SimpleSelect
                      options={SECTION_STATUS_OPTIONS.map(o => o.label)}
                      value={SECTION_STATUS_OPTIONS.find(o => o.value === sectionData[section.id]?.status)?.label || ''}
                      onChange={(v) => {
                        const opt = SECTION_STATUS_OPTIONS.find(o => o.label === v);
                        if (opt) updateSectionStatus(section.id, opt.value);
                      }}
                      placeholder="Selecione o status"
                    />
                  </div>

                  {/* Items */}
                  {section.subsections ? (
                    section.subsections.map(sub => (
                      <div key={sub.title} className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">{sub.title}</h4>
                        {sub.items.map(item => (
                          <div key={item.id} className="flex items-center gap-2 ml-2">
                            <Checkbox
                              checked={!!sectionData[section.id]?.items?.[item.id]}
                              onCheckedChange={(checked) => updateSectionItem(section.id, item.id, !!checked)}
                              disabled={isReadOnly}
                            />
                            <Label className="font-normal text-sm">{item.label}</Label>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    section.items?.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={!!sectionData[section.id]?.items?.[item.id]}
                          onCheckedChange={(checked) => updateSectionItem(section.id, item.id, !!checked)}
                          disabled={isReadOnly}
                        />
                        <Label className="font-normal text-sm">{item.label}</Label>
                      </div>
                    ))
                  )}

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={sectionData[section.id]?.observacoes || ''}
                      onChange={(e) => updateSectionObs(section.id, e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Observações sobre esta seção..."
                      rows={2}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Seção 9 - Necessidades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">9. Levantamento de Necessidades Iniciais</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.necessidades_iniciais}
                onChange={(e) => setFormData(p => ({ ...p, necessidades_iniciais: e.target.value }))}
                disabled={isReadOnly}
                placeholder="Relacionar intervenções prioritárias..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Seção 10 - Conclusão */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">10. Conclusão da Vistoria</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Classificação Geral</Label>
                <SimpleSelect
                  options={['Boa', 'Regular', 'Ruim']}
                  value={formData.classificacao_geral ? formData.classificacao_geral.charAt(0).toUpperCase() + formData.classificacao_geral.slice(1) : ''}
                  onChange={(v) => setFormData(p => ({ ...p, classificacao_geral: v.toLowerCase() }))}
                  placeholder="Selecione"
                />
              </div>
              <div className="space-y-2">
                <Label>Prazo estimado para adequação (dias)</Label>
                <Input
                  type="number"
                  value={formData.prazo_adequacao_dias}
                  onChange={(e) => setFormData(p => ({ ...p, prazo_adequacao_dias: e.target.value }))}
                  disabled={isReadOnly}
                  placeholder="Ex: 30"
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label>Observações Gerais</Label>
                <Textarea
                  value={formData.observacoes_gerais}
                  onChange={(e) => setFormData(p => ({ ...p, observacoes_gerais: e.target.value }))}
                  disabled={isReadOnly}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {!isReadOnly && (
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Rascunho
              </Button>
              <Button onClick={() => handleSave(true)} disabled={saving} className="gap-2">
                <Send className="h-4 w-4" />
                Enviar para Validação
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
