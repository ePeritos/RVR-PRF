import { UseFormRegister } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

interface TechnicalDataSectionProps {
  register: UseFormRegister<DadosCAIP>;
}

export const TechnicalDataSection = ({ register }: TechnicalDataSectionProps) => {
  const checkboxFields = [
    { key: 'adere_ao_pgprf_teletrabalho', label: 'Adere ao PGPRF? (TELETRABALHO)' },
    { key: 'ha_contrato_de_manutencao_predial', label: 'Há contrato de manutenção predial?' },
    { key: 'ha_plano_de_manutencao_do_imovel', label: 'Há plano de manutenção do imóvel?' },
    { key: 'o_trecho_e_concessionado', label: 'O trecho é concessionado?' },
    { key: 'acessibilidade', label: 'Acessibilidade?' },
    { key: 'sustentabilidade', label: 'Sustentabilidade?' },
    { key: 'aproveitamento_da_agua_da_chuva', label: 'Aproveitamento da água da chuva?' },
    { key: 'energia_solar', label: 'Energia Solar?' }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Dados Técnicos e Áreas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="vida_util_estimada_anos">Vida Útil Estimada (Anos)</Label>
          <Input type="number" {...register('vida_util_estimada_anos', { valueAsNumber: true })} placeholder="Ex: 60" />
        </div>
        <div>
          <Label htmlFor="area_do_terreno_m2">Área do Terreno (m²)</Label>
          <Input type="number" step="0.01" {...register('area_do_terreno_m2', { valueAsNumber: true })} placeholder="Ex: 500.00" />
        </div>
        <div>
          <Label htmlFor="area_construida_m2">Área Construída (m²)</Label>
          <Input type="number" step="0.01" {...register('area_construida_m2', { valueAsNumber: true })} placeholder="Ex: 250.50" />
        </div>
        <div>
          <Label htmlFor="area_do_patio_para_retencao_de_veiculos_m2">Área do Pátio para Retenção de Veículos (m²)</Label>
          <Input type="number" step="0.01" {...register('area_do_patio_para_retencao_de_veiculos_m2', { valueAsNumber: true })} placeholder="Ex: 100.00" />
        </div>
        <div>
          <Label htmlFor="area_da_cobertura_de_pista_m2">Área da Cobertura de Pista (m²)</Label>
          <Input type="number" step="0.01" {...register('area_da_cobertura_de_pista_m2', { valueAsNumber: true })} placeholder="Ex: 50.00" />
        </div>
        <div>
          <Label htmlFor="area_da_cobertura_para_fiscalizacao_de_veiculos_m2">Área da Cobertura para Fiscalização de Veículos (m²)</Label>
          <Input type="number" step="0.01" {...register('area_da_cobertura_para_fiscalizacao_de_veiculos_m2', { valueAsNumber: true })} placeholder="Ex: 30.00" />
        </div>
        <div>
          <Label htmlFor="idade_aparente_do_imovel">Idade Aparente do Imóvel</Label>
          <Input type="number" {...register('idade_aparente_do_imovel', { valueAsNumber: true })} placeholder="Idade em anos" />
        </div>
        <div>
          <Label htmlFor="ano_da_ultima_intervencao_na_infraestrutura_do_imovel">Ano da Última Intervenção na Infraestrutura</Label>
          <Input type="number" {...register('ano_da_ultima_intervencao_na_infraestrutura_do_imovel')} placeholder="Ano da intervenção" />
        </div>
        <div>
          <Label htmlFor="tempo_de_intervencao">Tempo de Intervenção</Label>
          <Input {...register('tempo_de_intervencao')} placeholder="Ex: 3 meses, 1 ano" />
        </div>
        <div>
          <Label htmlFor="ano_da_ultima_reavaliacao_rvr">Ano da Última Reavaliação (RVR)</Label>
          <Input type="number" {...register('ano_da_ultima_reavaliacao_rvr')} placeholder="Ano da última RVR" />
        </div>
        <div>
          <Label htmlFor="rvr">RVR</Label>
          <Input {...register('rvr')} placeholder="Detalhes do RVR" />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {checkboxFields.map(({ key, label }) => (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox {...register(key as keyof DadosCAIP)} />
            <Label>{label}</Label>
          </div>
        ))}
      </div>
    </Card>
  );
};