import { UseFormRegister } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

interface SecuritySectionProps {
  register: UseFormRegister<DadosCAIP>;
}

export const SecuritySection = ({ register }: SecuritySectionProps) => {
  const securityFields = [
    { key: 'claviculario', label: 'Claviculário' },
    { key: 'sala_cofre', label: 'Sala Cofre' },
    { key: 'concertina', label: 'Concertina' },
    { key: 'muro_ou_alambrado', label: 'Muro ou Alambrado' }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Segurança e Proteção</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityFields.map(({ key, label }) => (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox {...register(key as keyof DadosCAIP)} />
            <Label>{label}</Label>
          </div>
        ))}
      </div>
    </Card>
  );
};