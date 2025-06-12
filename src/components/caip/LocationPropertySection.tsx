import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

interface LocationPropertySectionProps {
  register: UseFormRegister<DadosCAIP>;
  setValue: UseFormSetValue<DadosCAIP>;
  estadosConservacao: Array<{ value: string; label: string }>;
}

export const LocationPropertySection = ({ register, setValue, estadosConservacao }: LocationPropertySectionProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Localização e Dados do Imóvel</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="endereco">Endereço</Label>
          <Textarea {...register('endereco')} placeholder="Endereço completo do imóvel" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="implantacao_da_unidade">Implantação da Unidade</Label>
            <Input {...register('implantacao_da_unidade')} placeholder="Tipo de implantação da unidade" />
          </div>
          <div>
            <Label htmlFor="coordenadas">Coordenadas</Label>
            <Input {...register('coordenadas')} placeholder="Ex: -XX.XXXXXX, -XX.XXXXXX" />
          </div>
          <div>
            <Label htmlFor="zona">Zona</Label>
            <Input {...register('zona')} placeholder="Zona (Urbana/Rural)" />
          </div>
          <div>
            <Label htmlFor="rip">RIP</Label>
            <Input {...register('rip')} placeholder="Número RIP do imóvel" />
          </div>
          <div>
            <Label htmlFor="matricula_do_imovel">Matrícula do Imóvel</Label>
            <Input {...register('matricula_do_imovel')} placeholder="Matrícula do imóvel (se houver)" />
          </div>
          <div>
            <Label htmlFor="tipo_de_imovel">Tipo de Imóvel</Label>
            <Select onValueChange={(value) => setValue('tipo_de_imovel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Urbano">Urbano</SelectItem>
                <SelectItem value="Rural">Rural</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="situacao_do_imovel">Situação do Imóvel</Label>
            <Input {...register('situacao_do_imovel')} placeholder="Ex: Regular, Irregular, Em obras" />
          </div>
          <div>
            <Label htmlFor="estado_de_conservacao">Estado de Conservação</Label>
            <Select onValueChange={(value) => setValue('estado_de_conservacao', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado de conservação" />
              </SelectTrigger>
              <SelectContent>
                {estadosConservacao.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
};