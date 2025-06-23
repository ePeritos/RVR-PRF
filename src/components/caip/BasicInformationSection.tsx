
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tables } from '@/integrations/supabase/types';
import { UNIDADES_GESTORAS, TIPOS_UNIDADE } from '@/constants/caipConstants';

type DadosCAIP = Tables<'dados_caip'>;

interface BasicInformationSectionProps {
  register: UseFormRegister<DadosCAIP>;
  setValue: UseFormSetValue<DadosCAIP>;
  watch: UseFormWatch<DadosCAIP>;
  errors: any;
}

export const BasicInformationSection = ({ register, setValue, watch, errors }: BasicInformationSectionProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="unidade_gestora" className="text-sm font-medium">
            Unidade Gestora *
          </Label>
          <Select 
            value={watch('unidade_gestora') || ''} 
            onValueChange={(value) => setValue('unidade_gestora', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a unidade gestora" />
            </SelectTrigger>
            <SelectContent>
              {UNIDADES_GESTORAS.map((unidade) => (
                <SelectItem key={unidade} value={unidade}>
                  {unidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unidade_gestora && (
            <p className="text-sm text-destructive mt-1">Este campo é obrigatório</p>
          )}
        </div>

        <div>
          <Label htmlFor="tipo_de_unidade" className="text-sm font-medium">
            Tipo de Unidade *
          </Label>
          <Select 
            value={watch('tipo_de_unidade') || ''} 
            onValueChange={(value) => setValue('tipo_de_unidade', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de unidade" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_UNIDADE.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipo_de_unidade && (
            <p className="text-sm text-destructive mt-1">Este campo é obrigatório</p>
          )}
        </div>

        <div>
          <Label htmlFor="nome_da_unidade" className="text-sm font-medium">
            Nome da Unidade *
          </Label>
          <Input
            {...register('nome_da_unidade')}
            placeholder="Nome da unidade"
          />
          {errors.nome_da_unidade && (
            <p className="text-sm text-destructive mt-1">Este campo é obrigatório</p>
          )}
        </div>

        <div>
          <Label htmlFor="ano_caip" className="text-sm font-medium">
            Ano CAIP *
          </Label>
          <Select 
            value={watch('ano_caip') || ''} 
            onValueChange={(value) => setValue('ano_caip', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ano_caip && (
            <p className="text-sm text-destructive mt-1">Este campo é obrigatório</p>
          )}
        </div>

        <div>
          <Label htmlFor="processo_sei" className="text-sm font-medium">
            Processo SEI
          </Label>
          <Input
            {...register('processo_sei')}
            placeholder="Número do processo SEI"
          />
        </div>

        <div>
          <Label htmlFor="servo2_pdi" className="text-sm font-medium">
            Servo2/PDI
          </Label>
          <Input
            {...register('servo2_pdi')}
            placeholder="Servo2/PDI"
          />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="endereco" className="text-sm font-medium">
          Endereço
        </Label>
        <Textarea
          {...register('endereco')}
          placeholder="Endereço completo"
          rows={2}
        />
      </div>

      <div className="mt-4">
        <Label htmlFor="observacoes" className="text-sm font-medium">
          Observações
        </Label>
        <Textarea
          {...register('observacoes')}
          placeholder="Observações gerais"
          rows={3}
        />
      </div>
    </Card>
  );
};
