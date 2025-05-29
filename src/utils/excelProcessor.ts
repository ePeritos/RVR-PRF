
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface ExcelRow {
  [key: string]: any;
}

// Mapeamento das colunas da planilha para os campos da tabela
const columnMapping: { [key: string]: string } = {
  'ID_CAIP': 'id_caip',
  'Cadastrador': 'cadastrador',
  'Alterador': 'alterador',
  'Última alteração': 'ultima_alteracao',
  'Ano CAIP': 'ano_caip',
  'Imagem Geral': 'imagem_geral',
  'Imagem Fachada': 'imagem_fachada',
  'Imagem Lateral 1': 'imagem_lateral_1',
  'Imagem Lateral 2': 'imagem_lateral_2',
  'Imagem Fundos': 'imagem_fundos',
  'Imagem Sala Cofre': 'imagem_sala_cofre',
  'Imagem Cofre': 'imagem_cofre',
  'Imagem Interna Alojamento Masculino': 'imagem_interna_alojamento_masculino',
  'Imagem Interna Alojamento Feminino': 'imagem_interna_alojamento_feminino',
  'Imagem Interna Plantão UOP': 'imagem_interna_plantao_uop',
  'Unidade Gestora': 'unidade_gestora',
  'Tipo de unidade': 'tipo_de_unidade',
  'Nome da unidade': 'nome_da_unidade',
  'Processo SEI': 'processo_sei',
  'Servo2 (PDI)': 'servo2_pdi',
  'Endereço': 'endereco',
  'Implantação da unidade': 'implantacao_da_unidade',
  'coordenadas': 'coordenadas',
  'Zona': 'zona',
  'RIP': 'rip',
  'Matrícula do imóvel': 'matricula_do_imovel',
  ' Adere ao PGPRF? (TELETRABALHO) ': 'adere_ao_pgprf_teletrabalho',
  'Ano da última reavaliação (RVR)': 'ano_da_ultima_reavaliacao_rvr',
  ' RVR ': 'rvr',
  'Tipo de imóvel': 'tipo_de_imovel',
  'Situação do imóvel': 'situacao_do_imovel',
  'Estado de Conservação': 'estado_de_conservacao',
  'Vida Útil Estimada (Anos) ': 'vida_util_estimada_anos',
  'Área do Terreno (m²)': 'area_do_terreno_m2',
  'Área construída (m²)': 'area_construida_m2',
  'Área do pátio para retenção de veículos (m²) ': 'area_do_patio_para_retencao_de_veiculos_m2',
  'Área da cobertura de pista (m²)': 'area_da_cobertura_de_pista_m2',
  'Área da cobertura para fiscalização de veículos (m²) ': 'area_da_cobertura_para_fiscalizacao_de_veiculos_m2',
  'Idade aparente do imóvel': 'idade_aparente_do_imovel',
  'Ano da última intervenção na infraestrutura do imóvel': 'ano_da_ultima_intervencao_na_infraestrutura_do_imovel',
  'Tempo de intervenção': 'tempo_de_intervencao',
  'Há contrato de manutenção predial?': 'ha_contrato_de_manutencao_predial',
  'Há plano de manutenção do imóvel?': 'ha_plano_de_manutencao_do_imovel',
  'O trecho é concessionado?': 'o_trecho_e_concessionado',
  'Acessibilidade?': 'acessibilidade',
  'sustentabilidade?': 'sustentabilidade',
  'aproveitamento da água da chuva?': 'aproveitamento_da_agua_da_chuva',
  'Energia Solar?': 'energia_solar',
  'Fornecimento de Água ?': 'fornecimento_de_agua',
  'Fornecimento de energia elétrica?': 'fornecimento_de_energia_eletrica',
  'Esgotamento sanitário?': 'esgotamento_sanitario',
  'Conexão de internet?\n': 'conexao_de_internet',
  'Possui Wireless (Wi-Fi)?': 'possui_wireless_wifi',
  'Identidade visual?': 'identidade_visual',
  'Blindagem?': 'blindagem',
  'Nota  para ADEQUAÇÃO?': 'nota_para_adequacao',
  'Nota para MANUTENÇÃO': 'nota_para_manutencao',
  'Precisaria de qual intervenção?': 'precisaria_de_qual_intervencao',
  'Observações': 'observacoes',
  'Almoxarifado': 'almoxarifado',
  'Alojamento Feminino': 'alojamento_feminino',
  'Alojamento masculino': 'alojamento_masculino',
  'Alojamento misto': 'alojamento_misto',
  'Área de serviço': 'area_de_servico',
  'Área de uso compartilhado com outros orgãos': 'area_de_uso_compartilhado_com_outros_orgaos',
  'Arquivo': 'arquivo',
  'Auditório': 'auditorio',
  'Banheiro para zeladoria': 'banheiro_para_zeladoria',
  'Banheiro feminino para servidoras': 'banheiro_feminino_para_servidoras',
  'Banheiro masculino para servidores': 'banheiro_masculino_para_servidores',
  'Banheiro misto para servidores': 'banheiro_misto_para_servidores',
  'Box com chuveiro externo': 'box_com_chuveiro_externo',
  'Box para lavagem de veículos': 'box_para_lavagem_de_veiculos',
  'Canil': 'canil',
  'Casa de máquinas': 'casa_de_maquinas',
  'Central de gás': 'central_de_gas',
  'Cobertura para aglomeração de usuários': 'cobertura_para_aglomeracao_de_usuarios',
  'Cobertura para fiscalização de veículos': 'cobertura_para_fiscalizacao_de_veiculos',
  'Copa e cozinha': 'copa_e_cozinha',
  'Depósito de lixo': 'deposito_de_lixo',
  'Depósito de materiais de descarte e baixa': 'deposito_de_materiais_de_descarte_e_baixa',
  'Depósito de material de limpeza': 'deposito_de_material_de_limpeza',
  'Depósito de material operacional': 'deposito_de_material_operacional',
  'Estacionamento para usuários': 'estacionamento_para_usuarios',
  'Garagem para servidores': 'garagem_para_servidores',
  'Garagem para viaturas': 'garagem_para_viaturas',
  'Lavabo para servidores (sem box para chuveiro)': 'lavabo_para_servidores_sem_box_para_chuveiro',
  'Local para custódia temporária de detidos': 'local_para_custodia_temporaria_de_detidos',
  'Local para guarda provisória de animais?': 'local_para_guarda_provisoria_de_animais',
  'Pátio de retenção de veículos?': 'patio_de_retencao_de_veiculos',
  'Plataforma para fiscalização da parte superior dos veículos?': 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos',
  'Ponto de pouso para aeronaves?': 'ponto_de_pouso_para_aeronaves',
  'Rampa de fiscalização de veículos?': 'rampa_de_fiscalizacao_de_veiculos',
  'Recepção?': 'recepcao',
  'Sala administrativa / Escritório?': 'sala_administrativa_escritorio',
  'Sala de assepsia?': 'sala_de_assepsia',
  'Sala de aula?': 'sala_de_aula',
  'Sala de reunião?': 'sala_de_reuniao',
  'Sala de revista pessoal?': 'sala_de_revista_pessoal',
  'Sala operacional / Observatório?': 'sala_operacional_observatorio',
  'Sala técnica': 'sala_tecnica',
  'Sanitário público?': 'sanitario_publico',
  'Telefone público?': 'telefone_publico',
  'Torre de telecomunicações': 'torre_de_telecomunicacoes',
  'Vestiário para não-policiais': 'vestiario_para_nao_policiais',
  'Vestiário para policiais': 'vestiario_para_policiais',
  'Abastecimento de água': 'abastecimento_de_agua',
  'Aterramento e proteção contra descargas atmosféricas': 'aterramento_e_protecao_contra_descargas_atmosfericas',
  'Climatização de ambientes': 'climatizacao_de_ambientes',
  'Coleta de lixo': 'coleta_de_lixo',
  'Energia elétrica de emergência?': 'energia_eletrica_de_emergencia',
  'Iluminação externa?': 'iluminacao_externa',
  'Proteção contra incêndios': 'protecao_contra_incendios',
  'Proteção contra intrusão?': 'protecao_contra_intrusao',
  'Radiocomunicação?': 'radiocomunicacao',
  'Cabeamento estruturado?': 'cabeamento_estruturado',
  'Claviculário?': 'claviculario',
  'Sala Cofre?': 'sala_cofre',
  'Concertina?': 'concertina',
  'Muro ou Alambrado?': 'muro_ou_alambrado',
  'Preenchido': 'preenchido',
  'Pecentual Preenchimento': 'percentual_preenchimento',
  'Gatilho': 'gatilho',
  'Data alteração preenchida?': 'data_alteracao_preenchida'
};

export const processExcelFile = async (file: File): Promise<{ success: boolean; message: string; count?: number }> => {
  try {
    console.log('Processando arquivo Excel:', file.name);
    
    // Ler o arquivo
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Pegar a primeira planilha
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Dados extraídos da planilha:', jsonData.length, 'linhas');
    console.log('Primeiras colunas encontradas:', Object.keys(jsonData[0] || {}));
    
    if (jsonData.length === 0) {
      return { success: false, message: 'Planilha vazia ou sem dados válidos' };
    }
    
    // Mapear e transformar os dados
    const mappedData = jsonData.map((row, index) => {
      const mappedRow: any = {};
      
      Object.keys(row).forEach(originalColumn => {
        // Tentar encontrar o mapeamento exato ou com variações de espaços
        const trimmedColumn = originalColumn.trim();
        let dbColumn = columnMapping[originalColumn] || columnMapping[trimmedColumn];
        
        // Se não encontrou, tentar variações
        if (!dbColumn) {
          const foundKey = Object.keys(columnMapping).find(key => 
            key.toLowerCase().trim() === trimmedColumn.toLowerCase()
          );
          if (foundKey) {
            dbColumn = columnMapping[foundKey];
          }
        }
        
        if (dbColumn) {
          let value = row[originalColumn];
          
          // Tratar valores numéricos
          if (dbColumn === 'rvr' || dbColumn.includes('area_')) {
            if (value !== null && value !== undefined && value !== '') {
              const numValue = Number(value);
              value = !isNaN(numValue) ? numValue : null;
            } else {
              value = null;
            }
          }
          
          // Tratar strings vazias
          if (typeof value === 'string') {
            value = value.trim();
            if (value === '') {
              value = null;
            }
          }
          
          mappedRow[dbColumn] = value;
        } else {
          console.log(`Coluna não mapeada: "${originalColumn}"`);
        }
      });
      
      console.log(`Linha ${index + 1} mapeada:`, Object.keys(mappedRow).length, 'campos');
      return mappedRow;
    }).filter(row => Object.keys(row).length > 0);
    
    console.log('Dados mapeados:', mappedData.length, 'registros válidos');
    
    if (mappedData.length === 0) {
      return { success: false, message: 'Nenhum dado válido encontrado após o mapeamento' };
    }
    
    // Inserir no Supabase em lotes menores
    const batchSize = 50;
    let totalInserted = 0;
    
    for (let i = 0; i < mappedData.length; i += batchSize) {
      const batch = mappedData.slice(i, i + batchSize);
      
      console.log(`Inserindo lote ${Math.floor(i / batchSize) + 1}:`, batch.length, 'registros');
      
      const { data, error } = await supabase
        .from('dados_caip')
        .insert(batch);
      
      if (error) {
        console.error('Erro ao inserir lote:', error);
        throw new Error(`Erro na inserção: ${error.message}`);
      }
      
      totalInserted += batch.length;
      console.log(`Lote inserido com sucesso. Total: ${totalInserted}/${mappedData.length}`);
    }
    
    return { 
      success: true, 
      message: `${totalInserted} registros importados com sucesso`, 
      count: totalInserted 
    };
    
  } catch (error) {
    console.error('Erro ao processar arquivo Excel:', error);
    return { 
      success: false, 
      message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    };
  }
};
