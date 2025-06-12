import { UseFormRegister } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

interface InfrastructureSectionProps {
  register: UseFormRegister<DadosCAIP>;
}

export const InfrastructureSection = ({ register }: InfrastructureSectionProps) => {
  const infrastructureFields = [
    { key: 'fornecimento_de_agua', label: 'Fornecimento de Água' },
    { key: 'fornecimento_de_energia_eletrica', label: 'Fornecimento de Energia Elétrica' },
    { key: 'esgotamento_sanitario', label: 'Esgotamento Sanitário' },
    { key: 'conexao_de_internet', label: 'Conexão de Internet' },
    { key: 'identidade_visual', label: 'Identidade Visual' },
    { key: 'possui_wireless_wifi', label: 'Possui Wireless (Wi-Fi)' },
    { key: 'blindagem', label: 'Blindagem' }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Infraestrutura e Utilidades</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {infrastructureFields.map(({ key, label }) => (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox {...register(key as keyof DadosCAIP)} />
            <Label>{label}</Label>
          </div>
        ))}
      </div>
    </Card>
  );
};