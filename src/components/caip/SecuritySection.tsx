import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

interface SecuritySectionProps {
  register: UseFormRegister<DadosCAIP>;
  setValue: UseFormSetValue<DadosCAIP>;
  watchedValues?: any;
}

export const SecuritySection = ({ register, setValue, watchedValues }: SecuritySectionProps) => {
  const securityFields = [
    { key: 'claviculario', label: 'Claviculário' },
    { key: 'sala_cofre', label: 'Sala Cofre' },
    { key: 'concertina', label: 'Concertina' },
    { key: 'muro_ou_alambrado', label: 'Muro ou Alambrado' }
  ];

  const handleSelectAll = (checked: boolean) => {
    securityFields.forEach(({ key }) => {
      setValue(key as keyof DadosCAIP, checked ? 'Sim' : 'Não');
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Segurança e Proteção</h3>
        <div className="flex items-center space-x-2">
          <Checkbox 
            onCheckedChange={handleSelectAll}
            id="select-all-security"
          />
          <Label htmlFor="select-all-security" className="text-sm font-medium">
            Marcar todos
          </Label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityFields.map(({ key, label }) => (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox 
              {...register(key as keyof DadosCAIP)}
              checked={watchedValues?.[key as keyof DadosCAIP] === 'Sim'}
              onCheckedChange={(checked) => setValue(key as keyof DadosCAIP, checked ? 'Sim' : 'Não')}
            />
            <Label>{label}</Label>
          </div>
        ))}
      </div>
    </Card>
  );
};