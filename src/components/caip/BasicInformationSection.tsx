import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

interface BasicInformationSectionProps {
  register: UseFormRegister<DadosCAIP>;
  setValue: UseFormSetValue<DadosCAIP>;
  errors: FieldErrors<DadosCAIP>;
  unidadesGestoras: string[];
  estadosConservacao: Array<{ value: string; label: string }>;
}

export const BasicInformationSection = ({ 
  register, 
  setValue, 
  errors, 
  unidadesGestoras, 
  estadosConservacao 
}: BasicInformationSectionProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Database className="h-5 w-5" />
        Informações Básicas
      </h3>
      {/* Campos automáticos ocultos */}
      <input type="hidden" {...register('cadastrador')} />
      <input type="hidden" {...register('alterador')} />
      <input type="hidden" {...register('ultima_alteracao')} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="ano_caip">Ano CAIP *</Label>
          <Input 
            type="text" 
            maxLength={4}
            {...register('ano_caip', { 
              required: "Campo obrigatório",
              pattern: {
                value: /^\d{4}$/,
                message: "O Ano CAIP deve ter 4 dígitos"
              },
              validate: (value) => {
                const year = parseInt(value);
                return !isNaN(year) && year % 2 !== 0 || "O Ano CAIP deve ser um número ímpar";
              }
            })} 
            placeholder="Ex: 2025 (ímpar)" 
          />
          {errors.ano_caip && (
            <p className="text-sm text-destructive mt-1">{errors.ano_caip.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="unidade_gestora">Unidade Gestora *</Label>
          <Select onValueChange={(value) => setValue('unidade_gestora', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma unidade gestora" />
            </SelectTrigger>
            <SelectContent>
              {unidadesGestoras.map((unidade) => (
                <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unidade_gestora && (
            <p className="text-sm text-destructive mt-1">{errors.unidade_gestora.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="tipo_de_unidade">Tipo de Unidade</Label>
          <Select onValueChange={(value) => setValue('tipo_de_unidade', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Superintendência">Superintendência</SelectItem>
              <SelectItem value="UOP">UOP</SelectItem>
              <SelectItem value="Delegacia">Delegacia</SelectItem>
              <SelectItem value="Posto">Posto</SelectItem>
              <SelectItem value="Base">Base</SelectItem>
              <SelectItem value="Escritório Regional">Escritório Regional</SelectItem>
              <SelectItem value="Centro de Treinamento">Centro de Treinamento</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="nome_da_unidade">Nome da Unidade *</Label>
          <Input {...register('nome_da_unidade', { required: "Campo obrigatório" })} placeholder="Nome completo da unidade" />
          {errors.nome_da_unidade && (
            <p className="text-sm text-destructive mt-1">{errors.nome_da_unidade.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="processo_sei">Processo SEI</Label>
          <Input {...register('processo_sei')} placeholder="Nº do processo SEI" />
        </div>
        <div>
          <Label htmlFor="servo2_pdi">Servo2 (PDI)</Label>
          <Input {...register('servo2_pdi')} placeholder="Informação do Servo2 (PDI)" />
        </div>
      </div>
    </Card>
  );
};