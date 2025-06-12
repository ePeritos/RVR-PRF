import { UseFormRegister } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

interface SystemsSectionProps {
  register: UseFormRegister<DadosCAIP>;
}

export const SystemsSection = ({ register }: SystemsSectionProps) => {
  const systemFields = [
    { key: 'abastecimento_de_agua', label: 'Abastecimento de Água' },
    { key: 'aterramento_e_protecao_contra_descargas_atmosfericas', label: 'Aterramento e Proteção contra Descargas Atmosféricas' },
    { key: 'climatizacao_de_ambientes', label: 'Climatização de Ambientes' },
    { key: 'coleta_de_lixo', label: 'Coleta de Lixo' },
    { key: 'energia_eletrica_de_emergencia', label: 'Energia Elétrica de Emergência' },
    { key: 'iluminacao_externa', label: 'Iluminação Externa' },
    { key: 'protecao_contra_incendios', label: 'Proteção contra Incêndios' },
    { key: 'protecao_contra_intrusao', label: 'Proteção contra Intrusão' },
    { key: 'radiocomunicacao', label: 'Radiocomunicação' },
    { key: 'cabeamento_estruturado', label: 'Cabeamento Estruturado' }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Sistemas e Equipamentos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemFields.map(({ key, label }) => (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox {...register(key as keyof DadosCAIP)} />
            <Label>{label}</Label>
          </div>
        ))}
      </div>
    </Card>
  );
};