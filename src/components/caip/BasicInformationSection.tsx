
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
  console.log('🏢 === BASIC INFORMATION SECTION ===');
  const watchedValues = {
    unidade_gestora: watch('unidade_gestora'),
    tipo_de_unidade: watch('tipo_de_unidade'),
    nome_da_unidade: watch('nome_da_unidade'),
    ano_caip: watch('ano_caip'),
    processo_sei: watch('processo_sei'),
    servo2_pdi: watch('servo2_pdi'),
    endereco: watch('endereco'),
    observacoes: watch('observacoes')
  };
  
  console.log('Valores atuais do formulário:', watchedValues);

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
            value={watchedValues.unidade_gestora || ''} 
            onValueChange={(value) => {
              console.log('🔄 Selecionando unidade gestora:', value);
              setValue('unidade_gestora', value);
            }}
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
            value={watchedValues.tipo_de_unidade || ''} 
            onValueChange={(value) => {
              console.log('🔄 Selecionando tipo de unidade:', value);
              setValue('tipo_de_unidade', value);
            }}
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
            value={watchedValues.nome_da_unidade || ''}
            onChange={(e) => {
              console.log('🔄 Alterando nome da unidade:', e.target.value);
              setValue('nome_da_unidade', e.target.value);
            }}
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
            value={watchedValues.ano_caip || ''} 
            onValueChange={(value) => {
              console.log('🔄 Selecionando ano CAIP:', value);
              setValue('ano_caip', value);
            }}
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
            value={watchedValues.processo_sei || ''}
            onChange={(e) => setValue('processo_sei', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="servo2_pdi" className="text-sm font-medium">
            Servo2/PDI
          </Label>
          <Input
            {...register('servo2_pdi')}
            placeholder="Servo2/PDI"
            value={watchedValues.servo2_pdi || ''}
            onChange={(e) => setValue('servo2_pdi', e.target.value)}
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
          value={watchedValues.endereco || ''}
          onChange={(e) => setValue('endereco', e.target.value)}
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
          value={watchedValues.observacoes || ''}
          onChange={(e) => setValue('observacoes', e.target.value)}
        />
      </div>
    </Card>
  );
};
