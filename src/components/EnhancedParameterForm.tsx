
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TooltipField } from './TooltipField';
import { useTemplates } from '@/hooks/useTemplates';
import { Save, Upload, Star, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParameterFormProps {
  onParametersChange: (parameters: any) => void;
  initialParameters?: any;
}

export function EnhancedParameterForm({ onParametersChange, initialParameters }: ParameterFormProps) {
  const [parameters, setParameters] = useState({
    cub: 2500,
    valorM2: 3000,
    bdi: 25,
    responsavelTecnico: '',
    ...initialParameters
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);

  const { templates, loading, salvarTemplate, excluirTemplate, definirPadrao } = useTemplates();
  const { toast } = useToast();

  // Tooltips explicativos
  const tooltips = {
    cub: "CUB (Custo Unitário Básico): Valor por metro quadrado estabelecido pelo Sinduscon para construção civil. Usado como base para cálculos de avaliação imobiliária.",
    valorM2: "Valor por Metro Quadrado: Preço médio do metro quadrado na região, baseado em pesquisas de mercado imobiliário local.",
    bdi: "BDI (Benefícios e Despesas Indiretas): Percentual que incide sobre custos diretos, incluindo administração central, lucro e impostos (geralmente entre 20% e 30%).",
    responsavelTecnico: "Responsável Técnico: Profissional habilitado (engenheiro ou arquiteto) responsável pela avaliação, com registro no CREA ou CAU."
  };

  useEffect(() => {
    // Carrega template padrão se existir
    const templatePadrao = templates.find(t => t.is_default);
    if (templatePadrao && !initialParameters) {
      setParameters(templatePadrao.parametros);
      onParametersChange(templatePadrao.parametros);
    }
  }, [templates, initialParameters, onParametersChange]);

  useEffect(() => {
    onParametersChange(parameters);
  }, [parameters, onParametersChange]);

  const handleParameterChange = (key: string, value: any) => {
    const newParameters = { ...parameters, [key]: value };
    setParameters(newParameters);
    
    // Preview em tempo real
    if (previewMode) {
      onParametersChange(newParameters);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do template é obrigatório",
        variant: "destructive",
      });
      return;
    }

    await salvarTemplate(templateName, templateDescription, parameters);
    setTemplateeName('');
    setTemplateDescription('');
    setShowSaveDialog(false);
  };

  const handleLoadTemplate = (template: any) => {
    setParameters(template.parametros);
    onParametersChange(template.parametros);
    setShowTemplatesDialog(false);
    
    toast({
      title: "Template carregado",
      description: `Template "${template.nome_template}" aplicado com sucesso`,
    });
  };

  const calcularPreview = () => {
    const areaExemplo = 200; // m²
    const idadeExemplo = 10; // anos
    
    const valorBase = parameters.cub * areaExemplo;
    const valorTerreno = parameters.valorM2 * areaExemplo;
    const valorComBDI = valorBase * (1 + parameters.bdi / 100);
    const depreciacao = Math.pow(0.9, idadeExemplo); // 10% ao ano
    const valorFinal = (valorComBDI + valorTerreno) * depreciacao;
    
    return {
      areaExemplo,
      idadeExemplo,
      valorBase,
      valorTerreno,
      valorComBDI,
      valorFinal
    };
  };

  const preview = calcularPreview();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Parâmetros de Avaliação</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Preview Ativo' : 'Ativar Preview'}
              </Button>
              <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Templates Salvos</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{template.nome_template}</span>
                            {template.is_default && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          {template.descricao && (
                            <p className="text-sm text-muted-foreground">{template.descricao}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleLoadTemplate(template)}
                          >
                            Usar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => definirPadrao(template.id)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => excluirTemplate(template.id)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Salvar Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome do Template</label>
                      <Input
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Ex: Parâmetros Região Sul"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrição (opcional)</label>
                      <Input
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        placeholder="Descrição do template"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveTemplate} className="flex-1">
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TooltipField 
              label="CUB (R$/m²)" 
              tooltip={tooltips.cub}
              htmlFor="cub"
            >
              <Input
                id="cub"
                type="number"
                value={parameters.cub}
                onChange={(e) => handleParameterChange('cub', Number(e.target.value))}
                placeholder="2500"
              />
            </TooltipField>

            <TooltipField 
              label="Valor por m² do Terreno (R$)" 
              tooltip={tooltips.valorM2}
              htmlFor="valorM2"
            >
              <Input
                id="valorM2"
                type="number"
                value={parameters.valorM2}
                onChange={(e) => handleParameterChange('valorM2', Number(e.target.value))}
                placeholder="3000"
              />
            </TooltipField>

            <TooltipField 
              label="BDI (%)" 
              tooltip={tooltips.bdi}
              htmlFor="bdi"
            >
              <Input
                id="bdi"
                type="number"
                value={parameters.bdi}
                onChange={(e) => handleParameterChange('bdi', Number(e.target.value))}
                placeholder="25"
                min="0"
                max="100"
              />
            </TooltipField>

            <TooltipField 
              label="Responsável Técnico" 
              tooltip={tooltips.responsavelTecnico}
              htmlFor="responsavelTecnico"
            >
              <Input
                id="responsavelTecnico"
                value={parameters.responsavelTecnico}
                onChange={(e) => handleParameterChange('responsavelTecnico', e.target.value)}
                placeholder="Nome do responsável técnico"
              />
            </TooltipField>
          </div>

          {/* Preview em tempo real */}
          {previewMode && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm text-blue-800">Preview do Cálculo</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Exemplo:</strong> Imóvel de {preview.areaExemplo}m² com {preview.idadeExemplo} anos</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>Valor Base: {preview.valorBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p>Valor Terreno: {preview.valorTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                  <div>
                    <p>Com BDI: {preview.valorComBDI.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p><strong>Valor Final: {preview.valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
