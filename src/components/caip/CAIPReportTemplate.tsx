import React from 'react';
import { Tables } from '@/integrations/supabase/types';
import { MaintenanceScore } from '@/hooks/useCAIPReport';

type DadosCAIP = Tables<'dados_caip'>;

interface CAIPReportTemplateProps {
  data: DadosCAIP & { maintenanceScores?: MaintenanceScore[] };
}

const starLabel = (score: number) => {
  const labels: Record<number, string> = {
    1: 'Péssimo', 2: 'Ruim', 3: 'Regular', 4: 'Bom', 5: 'Ótimo'
  };
  return labels[score] || '-';
};

const ScoreStars: React.FC<{ score: number }> = ({ score }) => (
  <span style={{ letterSpacing: '2px', fontSize: '14px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= score ? '#d97706' : '#d1d5db' }}>★</span>
    ))}
  </span>
);

export const CAIPReportTemplate: React.FC<CAIPReportTemplateProps> = ({ data }) => {
  const formatCurrency = (value: number | null) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatArea = (value: number | null) => {
    if (!value) return '-';
    return `${value.toLocaleString('pt-BR')} m²`;
  };

  const yn = (value: string | null) => value === 'Sim' ? 'Sim' : 'Não';

  const maintenanceScores = data.maintenanceScores || [];

  const cellLabel: React.CSSProperties = {
    padding: '6px 10px',
    fontWeight: 600,
    fontSize: '10px',
    color: '#374151',
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #e5e7eb',
    width: '45%',
    verticalAlign: 'top',
  };
  const cellValue: React.CSSProperties = {
    padding: '6px 10px',
    fontSize: '10px',
    color: '#111827',
    borderBottom: '1px solid #e5e7eb',
    verticalAlign: 'top',
  };

  const sectionTitle = (title: string): React.CSSProperties => ({
    fontSize: '11px',
    fontWeight: 700,
    color: '#ffffff',
    backgroundColor: '#1e3a5f',
    padding: '6px 10px',
    marginTop: '14px',
    marginBottom: '0',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  });

  const environments = [
    { label: 'Almoxarifado', value: data.almoxarifado },
    { label: 'Alojamento Feminino', value: data.alojamento_feminino },
    { label: 'Alojamento Masculino', value: data.alojamento_masculino },
    { label: 'Alojamento Misto', value: data.alojamento_misto },
    { label: 'Área de Serviço', value: data.area_de_servico },
    { label: 'Arquivo', value: data.arquivo },
    { label: 'Auditório', value: data.auditorio },
    { label: 'Banheiro para Zeladoria', value: data.banheiro_para_zeladoria },
    { label: 'Box com Chuveiro Externo', value: data.box_com_chuveiro_externo },
    { label: 'Box para Lavagem de Veículos', value: data.box_para_lavagem_de_veiculos },
    { label: 'Canil', value: data.canil },
    { label: 'Casa de Máquinas', value: data.casa_de_maquinas },
    { label: 'Central de Gás', value: data.central_de_gas },
    { label: 'Cobertura para Aglomeração', value: data.cobertura_para_aglomeracao_de_usuarios },
    { label: 'Cobertura para Fiscalização', value: data.cobertura_para_fiscalizacao_de_veiculos },
    { label: 'Copa e Cozinha', value: data.copa_e_cozinha },
    { label: 'Depósito de Lixo', value: data.deposito_de_lixo },
    { label: 'Depósito de Descarte', value: data.deposito_de_materiais_de_descarte_e_baixa },
    { label: 'Depósito de Limpeza', value: data.deposito_de_material_de_limpeza },
    { label: 'Depósito Operacional', value: data.deposito_de_material_operacional },
    { label: 'Estacionamento Usuários', value: data.estacionamento_para_usuarios },
    { label: 'Garagem Servidores', value: data.garagem_para_servidores },
    { label: 'Garagem Viaturas', value: data.garagem_para_viaturas },
    { label: 'Lavabo Servidores', value: data.lavabo_para_servidores_sem_box_para_chuveiro },
    { label: 'Custódia Temporária', value: data.local_para_custodia_temporaria_de_detidos },
    { label: 'Guarda de Animais', value: data.local_para_guarda_provisoria_de_animais },
    { label: 'Pátio Retenção Veículos', value: data.patio_de_retencao_de_veiculos },
    { label: 'Plataforma Fiscalização', value: data.plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos },
    { label: 'Ponto de Pouso', value: data.ponto_de_pouso_para_aeronaves },
    { label: 'Rampa Fiscalização', value: data.rampa_de_fiscalizacao_de_veiculos },
    { label: 'Recepção', value: data.recepcao },
    { label: 'Sala Administrativa', value: data.sala_administrativa_escritorio },
    { label: 'Sala de Assepsia', value: data.sala_de_assepsia },
    { label: 'Sala de Aula', value: data.sala_de_aula },
    { label: 'Sala de Reunião', value: data.sala_de_reuniao },
    { label: 'Sala de Revista Pessoal', value: data.sala_de_revista_pessoal },
    { label: 'Sala Operacional', value: data.sala_operacional_observatorio },
    { label: 'Sala Técnica', value: data.sala_tecnica },
    { label: 'Sanitário Público', value: data.sanitario_publico },
    { label: 'Telefone Público', value: data.telefone_publico },
    { label: 'Torre Telecomunicações', value: data.torre_de_telecomunicacoes },
    { label: 'Vestiário Não-Policiais', value: data.vestiario_para_nao_policiais },
    { label: 'Vestiário Policiais', value: data.vestiario_para_policiais },
  ];

  // Only show environments that exist (Sim)
  const presentEnvs = environments.filter(e => e.value === 'Sim');

  const getScoreForEnv = (label: string): MaintenanceScore | undefined => {
    // Fuzzy match between label and nome_ambiente
    const normalized = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return maintenanceScores.find(s => {
      const sNorm = s.nome_ambiente.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return sNorm.includes(normalized) || normalized.includes(sNorm) || 
             sNorm === normalized;
    });
  };

  const notaAdequacao = parseFloat(data.nota_para_adequacao || '0');
  const notaManutencao = parseFloat(data.nota_para_manutencao || '0');
  const notaGlobal = data.nota_global || 0;

  const getNotaColor = (nota: number) => {
    if (nota >= 80) return '#059669';
    if (nota >= 50) return '#d97706';
    return '#dc2626';
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: '10px',
      lineHeight: '1.5',
      color: '#111827',
      backgroundColor: '#ffffff',
      width: '210mm',
      maxWidth: '210mm',
      margin: '0 auto',
      padding: '12mm 15mm',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '3px solid #1e3a5f',
        paddingBottom: '10px',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ fontSize: '8px', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>
            Polícia Rodoviária Federal
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e3a5f', marginBottom: '2px' }}>
            Relatório CAIP
          </div>
          <div style={{ fontSize: '11px', color: '#374151' }}>
            {data.nome_da_unidade || 'Não informado'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e3a5f' }}>
            {data.ano_caip || '-'}
          </div>
          <div style={{ fontSize: '8px', color: '#6b7280' }}>
            {data.unidade_gestora || '-'} · {data.tipo_de_unidade || '-'}
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {[
          { label: 'Adequação', value: notaAdequacao },
          { label: 'Manutenção', value: notaManutencao },
          { label: 'Nota Global', value: notaGlobal },
        ].map((card) => (
          <div key={card.label} style={{
            flex: 1,
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px 12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '8px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
              {card.label}
            </div>
            <div style={{
              fontSize: '22px',
              fontWeight: 700,
              color: getNotaColor(card.value),
            }}>
              {card.value ? card.value.toFixed(1) : '-'}
            </div>
          </div>
        ))}
      </div>

      {/* DADOS GERAIS */}
      <div style={sectionTitle('Dados Gerais')} />
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
        <tbody>
          {[
            ['Endereço', data.endereco],
            ['Implantação', data.implantacao_da_unidade],
            ['Coordenadas', data.coordenadas],
            ['Processo SEI', data.processo_sei],
            ['RIP', data.rip],
            ['Matrícula', data.matricula_do_imovel],
            ['Tipo de Imóvel', data.tipo_de_imovel],
            ['Situação', data.situacao_do_imovel],
            ['Estado de Conservação', data.estado_de_conservacao],
            ['Idade Aparente', data.idade_aparente_do_imovel ? `${data.idade_aparente_do_imovel} anos` : null],
            ['Vida Útil Estimada', data.vida_util_estimada_anos ? `${data.vida_util_estimada_anos} anos` : null],
            ['RVR', formatCurrency(data.rvr)],
            ['Última Intervenção', data.ano_da_ultima_intervencao_na_infraestrutura_do_imovel],
          ].map(([label, value], i) => (
            <tr key={i}>
              <td style={cellLabel}>{label}</td>
              <td style={cellValue}>{value || 'Não informado'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ÁREAS */}
      <div style={sectionTitle('Áreas')} />
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
        <tbody>
          {[
            ['Área do Terreno', formatArea(data.area_do_terreno_m2)],
            ['Área Construída', formatArea(data.area_construida_m2)],
            ['Pátio Retenção Veículos', formatArea(data.area_do_patio_para_retencao_de_veiculos_m2)],
            ['Cobertura Fiscalização', formatArea(data.area_da_cobertura_para_fiscalizacao_de_veiculos_m2)],
            ['Cobertura de Pista', formatArea(data.area_da_cobertura_de_pista_m2)],
          ].map(([label, value], i) => (
            <tr key={i}>
              <td style={cellLabel}>{label}</td>
              <td style={cellValue}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* INFRAESTRUTURA */}
      <div style={sectionTitle('Infraestrutura e Sistemas')} />
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
        <tbody>
          {[
            ['Fornecimento de Água', yn(data.fornecimento_de_agua)],
            ['Fornecimento de Energia', yn(data.fornecimento_de_energia_eletrica)],
            ['Esgotamento Sanitário', yn(data.esgotamento_sanitario)],
            ['Conexão Internet', yn(data.conexao_de_internet)],
            ['Wi-Fi', yn(data.possui_wireless_wifi)],
            ['Energia Solar', yn(data.energia_solar)],
            ['Energia Emergência', yn(data.energia_eletrica_de_emergencia)],
            ['Climatização', yn(data.climatizacao_de_ambientes)],
            ['Proteção Incêndio', yn(data.protecao_contra_incendios)],
            ['Proteção Intrusão', yn(data.protecao_contra_intrusao)],
            ['Iluminação Externa', yn(data.iluminacao_externa)],
            ['Radiocomunicação', yn(data.radiocomunicacao)],
            ['Cabeamento Estruturado', yn(data.cabeamento_estruturado)],
            ['Aterramento/DPS', yn(data.aterramento_e_protecao_contra_descargas_atmosfericas)],
            ['Acessibilidade', yn(data.acessibilidade)],
            ['Identidade Visual', yn(data.identidade_visual)],
            ['Blindagem', yn(data.blindagem)],
            ['Muro/Alambrado', yn(data.muro_ou_alambrado)],
            ['Concertina', yn(data.concertina)],
            ['Sala Cofre', yn(data.sala_cofre)],
            ['Claviculário', yn(data.claviculario)],
          ].map(([label, value], i) => (
            <tr key={i}>
              <td style={cellLabel}>{label}</td>
              <td style={{
                ...cellValue,
                color: value === 'Sim' ? '#059669' : '#dc2626',
                fontWeight: 600,
              }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* AMBIENTES COM NOTA DE MANUTENÇÃO */}
      <div style={sectionTitle('Ambientes — Presença e Conservação')} />
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <th style={{ ...cellLabel, width: '40%', fontSize: '9px' }}>Ambiente</th>
            <th style={{ ...cellLabel, width: '12%', textAlign: 'center', fontSize: '9px' }}>Possui?</th>
            <th style={{ ...cellLabel, width: '28%', textAlign: 'center', fontSize: '9px' }}>Conservação</th>
            <th style={{ ...cellLabel, width: '20%', textAlign: 'center', fontSize: '9px' }}>Classificação</th>
          </tr>
        </thead>
        <tbody>
          {environments.map((env, i) => {
            const score = getScoreForEnv(env.label);
            const hasSim = env.value === 'Sim';
            return (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                <td style={{ ...cellValue, fontWeight: 500 }}>{env.label}</td>
                <td style={{
                  ...cellValue,
                  textAlign: 'center',
                  color: hasSim ? '#059669' : '#9ca3af',
                  fontWeight: 600,
                }}>
                  {hasSim ? 'Sim' : 'Não'}
                </td>
                <td style={{ ...cellValue, textAlign: 'center' }}>
                  {hasSim && score ? <ScoreStars score={score.score_conservacao} /> : (
                    <span style={{ color: '#d1d5db', fontSize: '9px' }}>{hasSim ? 'Sem avaliação' : '-'}</span>
                  )}
                </td>
                <td style={{
                  ...cellValue,
                  textAlign: 'center',
                  fontSize: '9px',
                  fontWeight: 500,
                  color: score ? (score.score_conservacao >= 4 ? '#059669' : score.score_conservacao >= 3 ? '#d97706' : '#dc2626') : '#9ca3af',
                }}>
                  {hasSim && score ? starLabel(score.score_conservacao) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Resumo Manutenção */}
      {maintenanceScores.length > 0 && (
        <>
          <div style={sectionTitle('Resumo da Avaliação de Manutenção')} />
          <div style={{
            border: '1px solid #e5e7eb',
            padding: '10px 12px',
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
          }}>
            <div>
              <span style={{ fontSize: '9px', color: '#6b7280' }}>Ambientes avaliados: </span>
              <span style={{ fontWeight: 700 }}>{maintenanceScores.length}</span>
            </div>
            <div>
              <span style={{ fontSize: '9px', color: '#6b7280' }}>Média conservação: </span>
              <span style={{ fontWeight: 700, color: getNotaColor(
                (maintenanceScores.reduce((s, m) => s + m.score_conservacao, 0) / maintenanceScores.length) * 20
              ) }}>
                {(maintenanceScores.reduce((s, m) => s + m.score_conservacao, 0) / maintenanceScores.length).toFixed(1)} / 5
              </span>
            </div>
            <div>
              <span style={{ fontSize: '9px', color: '#6b7280' }}>Ótimo/Bom: </span>
              <span style={{ fontWeight: 700, color: '#059669' }}>
                {maintenanceScores.filter(m => m.score_conservacao >= 4).length}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '9px', color: '#6b7280' }}>Regular: </span>
              <span style={{ fontWeight: 700, color: '#d97706' }}>
                {maintenanceScores.filter(m => m.score_conservacao === 3).length}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '9px', color: '#6b7280' }}>Ruim/Péssimo: </span>
              <span style={{ fontWeight: 700, color: '#dc2626' }}>
                {maintenanceScores.filter(m => m.score_conservacao <= 2).length}
              </span>
            </div>
          </div>
        </>
      )}

      {/* OBSERVAÇÕES */}
      <div style={sectionTitle('Observações')} />
      <div style={{ border: '1px solid #e5e7eb', padding: '10px 12px' }}>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '9px', fontWeight: 600, color: '#6b7280', marginBottom: '2px' }}>Precisaria de qual intervenção?</div>
          <div style={{ fontSize: '10px' }}>{data.precisaria_de_qual_intervencao || 'Não informado'}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', fontWeight: 600, color: '#6b7280', marginBottom: '2px' }}>Observações Gerais</div>
          <div style={{ fontSize: '10px' }}>{data.observacoes || 'Não informado'}</div>
        </div>
      </div>

      {/* Manutenção */}
      <div style={{ border: '1px solid #e5e7eb', padding: '8px 12px', marginTop: '0', display: 'flex', gap: '20px' }}>
        <div>
          <span style={{ fontSize: '9px', color: '#6b7280' }}>Contrato manutenção predial: </span>
          <span style={{ fontWeight: 600, color: data.ha_contrato_de_manutencao_predial === 'Sim' ? '#059669' : '#dc2626' }}>
            {yn(data.ha_contrato_de_manutencao_predial)}
          </span>
        </div>
        <div>
          <span style={{ fontSize: '9px', color: '#6b7280' }}>Plano de manutenção: </span>
          <span style={{ fontWeight: 600, color: data.ha_plano_de_manutencao_do_imovel === 'Sim' ? '#059669' : '#dc2626' }}>
            {yn(data.ha_plano_de_manutencao_do_imovel)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '2px solid #1e3a5f',
        marginTop: '16px',
        paddingTop: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '8px',
        color: '#9ca3af',
      }}>
        <span>CAIP — Coeficiente de Adequação da Infraestrutura Predial</span>
        <span>Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};
