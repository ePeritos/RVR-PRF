import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlertTriangle, CheckCircle, Clock, Search, Building2, ChevronDown } from 'lucide-react';

const getCompletionBadge = (value: number) => {
  if (value >= 80) return { label: 'Completo', variant: 'default' as const, icon: CheckCircle };
  if (value >= 50) return { label: 'Parcial', variant: 'secondary' as const, icon: Clock };
  return { label: 'Baixo', variant: 'destructive' as const, icon: AlertTriangle };
};

interface PropertyDetailTableProps {
  data: any[];
}

type StatusFilter = 'todos' | 'completo' | 'parcial' | 'baixo';

export const PropertyDetailTable = ({ data }: PropertyDetailTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [visibleCount, setVisibleCount] = useState(20);

  const processedData = useMemo(() => {
    return data
      .map(item => ({
        id: item.id,
        nome: item.nome_da_unidade || 'Sem nome',
        tipo: item.tipo_de_unidade || '-',
        unidadeGestora: (item.unidade_gestora || 'Não informado').replace('SPRF/', ''),
        percentual: Math.min(parseFloat(item.percentual_preenchimento || '0'), 100),
      }))
      .sort((a, b) => a.percentual - b.percentual);
  }, [data]);

  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unidadeGestora.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'completo' && item.percentual >= 80) ||
        (statusFilter === 'parcial' && item.percentual >= 50 && item.percentual < 80) ||
        (statusFilter === 'baixo' && item.percentual < 50);

      return matchesSearch && matchesStatus;
    });
  }, [processedData, searchTerm, statusFilter]);

  const visibleData = filteredData.slice(0, visibleCount);
  const hasMore = visibleCount < filteredData.length;

  const statusCounts = useMemo(() => {
    const counts = { completo: 0, parcial: 0, baixo: 0 };
    processedData.forEach(item => {
      if (item.percentual >= 80) counts.completo++;
      else if (item.percentual >= 50) counts.parcial++;
      else counts.baixo++;
    });
    return counts;
  }, [processedData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Detalhamento por Imóvel
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {filteredData.length} imóveis encontrados — ordenados por menor preenchimento
        </p>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou unidade gestora..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(20); }}
              className="pl-9"
            />
          </div>
          <ToggleGroup
            type="single"
            value={statusFilter}
            onValueChange={(v) => { if (v) { setStatusFilter(v as StatusFilter); setVisibleCount(20); } }}
            className="flex-shrink-0"
          >
            <ToggleGroupItem value="todos" className="text-xs">
              Todos ({processedData.length})
            </ToggleGroupItem>
            <ToggleGroupItem value="baixo" className="text-xs">
              Baixo ({statusCounts.baixo})
            </ToggleGroupItem>
            <ToggleGroupItem value="parcial" className="text-xs">
              Parcial ({statusCounts.parcial})
            </ToggleGroupItem>
            <ToggleGroupItem value="completo" className="text-xs">
              Completo ({statusCounts.completo})
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Imóvel</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">Tipo</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">UG</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Preenchimento</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleData.map((item) => {
                const badge = getCompletionBadge(item.percentual);
                const Icon = badge.icon;
                return (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2 px-3 font-medium text-foreground max-w-[200px] truncate">
                      {item.nome}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground hidden md:table-cell">{item.tipo}</td>
                    <td className="py-2 px-3 text-muted-foreground hidden sm:table-cell">{item.unidadeGestora}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2 justify-center">
                        <Progress value={item.percentual} className="w-20 h-2" />
                        <span className="text-foreground font-medium min-w-[3ch] text-right">{item.percentual}%</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant={badge.variant} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {badge.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {visibleData.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Nenhum imóvel encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setVisibleCount(prev => prev + 20)}
              className="gap-2"
            >
              <ChevronDown className="h-4 w-4" />
              Carregar mais ({filteredData.length - visibleCount} restantes)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
