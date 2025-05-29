
import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterData {
  anoCAIP: string;
  tipoUnidade: string;
  unidadeGestora: string;
}

interface DataFilterProps {
  onFilterChange: (filters: FilterData) => void;
}

export function DataFilter({ onFilterChange }: DataFilterProps) {
  const [filters, setFilters] = useState<FilterData>({
    anoCAIP: '',
    tipoUnidade: '',
    unidadeGestora: ''
  });

  const handleFilterChange = (key: keyof FilterData, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { anoCAIP: '', tipoUnidade: '', unidadeGestora: '' };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  // Anos CAIP disponíveis
  const anosDisponiveis = ['2021', '2023', '2025'];

  // Tipos de unidade comuns na base CAIP
  const tiposUnidade = [
    'UOP',
    'DEL',
    'SEDE REGIONAL',
    'SEDE NACIONAL',
    'UNIPRF',
    'CANIL',
    'HANGAR',
    'ESTANDE DE TIROS',
    'PONTO DE APOIO',
    'OUTROS'
  ];

  // Unidades gestoras
  const unidadesGestoras = [
    'SEDE NACIONAL/DF',
    'UNIPRF/SC',
    'SPRF/AC',
    'SPRF/AL',
    'SPRF/AM',
    'SPRF/AP',
    'SPRF/BA',
    'SPRF/CE',
    'SPRF/DF',
    'SPRF/ES',
    'SPRF/GO',
    'SPRF/MA',
    'SPRF/MG',
    'SPRF/MS',
    'SPRF/MT',
    'SPRF/PA',
    'SPRF/PB',
    'SPRF/PE',
    'SPRF/PI',
    'SPRF/PR',
    'SPRF/RJ',
    'SPRF/RN',
    'SPRF/RO',
    'SPRF/RR',
    'SPRF/RS',
    'SPRF/SC',
    'SPRF/SE',
    'SPRF/SP',
    'SPRF/TO'
  ];

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Filtros de Dados</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Ano CAIP</Label>
          <Select value={filters.anoCAIP} onValueChange={(value) => handleFilterChange('anoCAIP', value)}>
            <SelectTrigger className="bg-background border-border focus:border-primary">
              <SelectValue placeholder="Selecionar ano" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {anosDisponiveis.map((ano) => (
                <SelectItem key={ano} value={ano}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Tipo de Unidade</Label>
          <Select value={filters.tipoUnidade} onValueChange={(value) => handleFilterChange('tipoUnidade', value)}>
            <SelectTrigger className="bg-background border-border focus:border-primary">
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {tiposUnidade.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Unidade Gestora</Label>
          <Select value={filters.unidadeGestora} onValueChange={(value) => handleFilterChange('unidadeGestora', value)}>
            <SelectTrigger className="bg-background border-border focus:border-primary">
              <SelectValue placeholder="Selecionar unidade" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {unidadesGestoras.map((unidade) => (
                <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="outline" onClick={clearFilters} className="hover-scale">
          Limpar Filtros
        </Button>
      </div>
    </Card>
  );
}
