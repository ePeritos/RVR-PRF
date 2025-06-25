
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info } from 'lucide-react';
import { UNIDADES_GESTORAS, TIPOS_UNIDADE } from '@/constants/caipConstants';

interface BasicInformationSectionProps {
  register: any;
  setValue: any;
  watch: any;
  errors: any;
}

export const BasicInformationSection = ({ register, setValue, watch, errors }: BasicInformationSectionProps) => {
  // Gerar anos de 2021 até 2025
  const currentYear = new Date().getFullYear();
  const startYear = 2021;
  const endYear = Math.max(currentYear + 1, 2025); // Garante que 2025 sempre esteja incluído
  
  const years = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push(year.toString());
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Info className="h-5 w-5" />
        Informações Básicas
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ano_caip">Ano CAIP *</Label>
          <Select onValueChange={(value) => setValue('ano_caip', value)} value={watch('ano_caip') || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ano_caip && (
            <p className="text-sm text-red-500">{errors.ano_caip.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unidade_gestora">Unidade Gestora *</Label>
          <Select onValueChange={(value) => setValue('unidade_gestora', value)} value={watch('unidade_gestora') || ''}>
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
            <p className="text-sm text-red-500">{errors.unidade_gestora.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_de_unidade">Tipo de Unidade *</Label>
          <Select onValueChange={(value) => setValue('tipo_de_unidade', value)} value={watch('tipo_de_unidade') || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
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
            <p className="text-sm text-red-500">{errors.tipo_de_unidade.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome_da_unidade">Nome da Unidade</Label>
          <Input
            id="nome_da_unidade"
            {...register('nome_da_unidade')}
            placeholder="Ex: PRF - Delegacia de Florianópolis"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="id_caip">ID CAIP</Label>
          <Input
            id="id_caip"
            {...register('id_caip')}
            placeholder="Ex: 123"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="processo_sei">Processo SEI</Label>
          <Input
            id="processo_sei"
            {...register('processo_sei')}
            placeholder="Ex: 08245.123456/2023-78"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="servo2_pdi">SERVO2 PDI</Label>
          <Input
            id="servo2_pdi"
            {...register('servo2_pdi')}
            placeholder="Ex: PDI12345"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            {...register('endereco')}
            placeholder="Ex: Rua das Flores, 123, Centro, Florianópolis/SC"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="implantacao_da_unidade">Implantação da Unidade</Label>
          <Input
            id="implantacao_da_unidade"
            {...register('implantacao_da_unidade')}
            placeholder="Ex: 2010"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coordenadas">Coordenadas</Label>
          <Input
            id="coordenadas"
            {...register('coordenadas')}
            placeholder="Ex: -27.5954, -48.5480"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zona">Zona</Label>
          <Input
            id="zona"
            {...register('zona')}
            placeholder="Ex: Urbana"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rip">RIP</Label>
          <Input
            id="rip"
            {...register('rip')}
            placeholder="Ex: 123456789"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="matricula_do_imovel">Matrícula do Imóvel</Label>
          <Input
            id="matricula_do_imovel"
            {...register('matricula_do_imovel')}
            placeholder="Ex: 12345"
          />
        </div>
      </div>
    </Card>
  );
};
