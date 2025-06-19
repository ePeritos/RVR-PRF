import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { useCAIPReport } from '@/hooks/useCAIPReport';
import { useToast } from '@/hooks/use-toast';

const RelatorioPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateReport, isGenerating } = useCAIPReport();
  const { toast } = useToast();
  
  const reportData = location.state?.reportData;

  console.log('=== DEBUG RelatorioPreview COMPLETO ===');
  console.log('Location state:', location.state);
  console.log('Report data:', reportData);
  console.log('Report data type:', typeof reportData);

  if (!reportData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">
            Dados do relatório não encontrados. Tente gerar o relatório novamente.
          </p>
          <Button onClick={() => navigate('/relatorios')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Relatórios
          </Button>
        </div>
      </div>
    );
  }

  const handleGeneratePDF = async () => {
    try {
      console.log('Iniciando geração de PDF com dados:', reportData);
      await generateReport(reportData);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o PDF. Verifique os logs do console.",
        variant: "destructive",
      });
    }
  };

  // Labels para os campos (versão expandida)
  const fieldLabels: Record<string, string> = {
    'nome_da_unidade': 'Nome da Unidade',
    'tipo_de_unidade': 'Tipo de Unidade', 
    'unidade_gestora': 'Unidade Gestora',
    'endereco': 'Endereço',
    'ano_caip': 'Ano CAIP',
    'area_construida_m2': 'Área Construída (m²)',
    'area_do_terreno_m2': 'Área do Terreno (m²)',
    'estado_de_conservacao': 'Estado de Conservação',
    'alojamento_feminino': 'Alojamento Feminino',
    'alojamento_masculino': 'Alojamento Masculino',
    'alojamento_misto': 'Alojamento Misto',
    'rvr': 'RVR',
    'nota_global': 'Nota Global',
    'vida_util_estimada_anos': 'Vida Útil Estimada (anos)',
    'processo_sei': 'Processo SEI',
    'servo2_pdi': 'Servo2/PDI',
    'coordenadas': 'Coordenadas',
    'zona': 'Zona',
    'rip': 'RIP',
    'matricula_do_imovel': 'Matrícula do Imóvel',
    'imagem_geral': 'Imagem Geral',
    'imagem_fachada': 'Imagem da Fachada',
    'imagem_lateral_1': 'Imagem Lateral 1',
    'imagem_lateral_2': 'Imagem Lateral 2',
    'imagem_fundos': 'Imagem dos Fundos',
    'imagem_sala_cofre': 'Imagem Sala Cofre',
    'imagem_cofre': 'Imagem do Cofre',
    'imagem_interna_alojamento_masculino': 'Imagem Alojamento Masculino',
    'imagem_interna_alojamento_feminino': 'Imagem Alojamento Feminino',
    'imagem_interna_plantao_uop': 'Imagem Plantão UOP'
  };

  const formatValue = (value: any, field: string): string => {
    if (value === null || value === undefined || value === '') return 'Não informado';
    
    if (field.includes('area_') || field.includes('m2')) {
      return `${Number(value).toLocaleString('pt-BR')} m²`;
    }
    
    if (field === 'rvr') {
      return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    
    return String(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/relatorios')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Preview do Relatório</h1>
            <p className="text-muted-foreground">
              Verifique os dados antes de gerar o PDF
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
        >
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
        </Button>
      </div>

      {/* Debug Info */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2 text-yellow-800">Debug - Informações do Relatório:</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>Título:</strong> {reportData.titulo}</p>
          <p><strong>Total de imóveis:</strong> {reportData.total_imoveis}</p>
          <p><strong>Incluir imagens:</strong> {reportData.incluir_imagens ? 'Sim' : 'Não'}</p>
          <p><strong>Campos selecionados:</strong> {reportData.campos_incluidos?.length || 0}</p>
          <p><strong>Dados disponíveis:</strong> {reportData.dados?.length || 0} registros</p>
        </div>
        
        <details className="mt-3">
          <summary className="cursor-pointer font-medium text-yellow-800">Ver campos selecionados</summary>
          <div className="mt-2 text-xs bg-yellow-100 p-2 rounded border">
            {reportData.campos_incluidos?.join(', ') || 'Nenhum campo selecionado'}
          </div>
        </details>

        <details className="mt-2">
          <summary className="cursor-pointer font-medium text-yellow-800">Ver primeiro registro (dados brutos)</summary>
          <div className="mt-2 text-xs bg-yellow-100 p-2 rounded border max-h-40 overflow-auto">
            <pre>{JSON.stringify(reportData.dados?.[0] || {}, null, 2)}</pre>
          </div>
        </details>
      </div>

      {/* Preview Container */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="mb-4 text-center text-sm text-gray-600 border-b pb-4">
          <strong>Preview do Relatório - Exatamente como aparecerá no PDF</strong>
        </div>
        
        {/* Cabeçalho do Relatório */}
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-2">{reportData.titulo}</h1>
          {reportData.descricao && (
            <p className="text-sm text-gray-600 mb-2">{reportData.descricao}</p>
          )}
          <div className="text-xs text-gray-500">
            <p>Gerado em: {reportData.data_geracao}</p>
            <p>Por: {reportData.gerado_por}</p>
            <p>Total de imóveis: {reportData.total_imoveis}</p>
          </div>
        </div>

        {/* Dados dos Imóveis */}
        {reportData.dados && reportData.dados.length > 0 ? (
          reportData.dados.map((imovel: any, index: number) => {
            console.log(`Renderizando imóvel ${index}:`, imovel);
            
            return (
              <div key={imovel.id || index} className="mb-8 border border-gray-300 rounded p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  {imovel.nome_da_unidade || `Imóvel ${index + 1}`}
                </h2>
                
                {/* Campos de dados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {reportData.campos_incluidos
                    ?.filter((campo: string) => !campo.startsWith('imagem_'))
                    ?.map((campo: string) => {
                      console.log(`Campo ${campo}: ${imovel[campo]}`);
                      return (
                        <div key={campo} className="flex flex-col border-b border-gray-100 pb-2">
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            {fieldLabels[campo] || campo}
                          </span>
                          <span className="text-sm text-gray-800 mt-1">
                            {formatValue(imovel[campo], campo)}
                          </span>
                        </div>
                      );
                    })}
                </div>

                {/* Imagens */}
                {reportData.incluir_imagens && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Imagens</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {reportData.campos_incluidos
                        ?.filter((campo: string) => campo.startsWith('imagem_'))
                        ?.map((campo: string) => {
                          console.log(`Imagem ${campo}: ${imovel[campo]}`);
                          return (
                            <div key={campo} className="text-center">
                              <p className="text-xs text-gray-600 mb-1 font-medium">
                                {fieldLabels[campo] || campo.replace('imagem_', '').replace('_', ' ')}
                              </p>
                              {imovel[campo] && imovel[campo].trim() !== '' ? (
                                <img 
                                  src={`https://sbefwlhezngkwsxybrsj.supabase.co/storage/v1/object/public/caip-images/${imovel[campo]}`}
                                  alt={fieldLabels[campo] || campo}
                                  className="w-full h-32 object-cover border border-gray-200 rounded"
                                  onLoad={() => console.log(`✅ Imagem carregada: ${campo}`)}
                                  onError={(e) => {
                                    console.log(`❌ Erro ao carregar: ${campo} - ${imovel[campo]}`);
                                    // Tentar URL direta se a primeira falhar
                                    const target = e.target as HTMLImageElement;
                                    if (!target.src.startsWith('http') && !target.dataset.tried) {
                                      target.dataset.tried = 'true';
                                      target.src = imovel[campo]; // Tentar URL direta
                                    } else {
                                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+SW1hZ2VtIG7Do28gZGlzcG9uw612ZWw8L3RleHQ+Cjwvc3ZnPgo=';
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-32 flex items-center justify-center border border-gray-300 rounded bg-gray-50">
                                  <p className="text-xs text-gray-500 text-center px-2">
                                    Imagem não disponível no banco de dados
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center text-red-600 p-8">
            <p className="font-semibold">❌ Nenhum dado encontrado para exibir</p>
            <p className="text-sm mt-2">Verifique se os imóveis foram selecionados corretamente</p>
          </div>
        )}

        {/* Rodapé */}
        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-300">
          <p>Sistema Integrado de Gestão de Imóveis - SIGI-PRF</p>
          <p>Relatório gerado automaticamente em {reportData.data_geracao}</p>
        </div>
      </div>
    </div>
  );
};

export default RelatorioPreview;