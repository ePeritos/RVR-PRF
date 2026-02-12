import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, Image } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const IMAGE_FIELDS = [
  { key: 'imagem_geral', label: 'Imagem Geral' },
  { key: 'imagem_fachada', label: 'Fachada' },
  { key: 'imagem_lateral_1', label: 'Lateral 1' },
  { key: 'imagem_lateral_2', label: 'Lateral 2' },
  { key: 'imagem_fundos', label: 'Fundos' },
  { key: 'imagem_sala_cofre', label: 'Sala Cofre' },
  { key: 'imagem_cofre', label: 'Cofre' },
  { key: 'imagem_interna_alojamento_masculino', label: 'Alojamento Masculino' },
  { key: 'imagem_interna_alojamento_feminino', label: 'Alojamento Feminino' },
  { key: 'imagem_interna_plantao_uop', label: 'Plantão UOP' },
];

interface CompletionDashboardProps {
  data: any[];
}

interface RegionalStats {
  unidade: string;
  totalImoveis: number;
  mediaPreenchimento: number;
  completosCount: number;
  parcialCount: number;
  baixoCount: number;
}

const getCompletionColor = (value: number, theme: string) => {
  if (theme === 'dark') {
    if (value >= 80) return '#93c5fd'; // blue-300
    if (value >= 50) return '#60a5fa'; // blue-400
    return '#3b82f6'; // blue-500
  }
  // light mode
  if (value >= 80) return '#1d4ed8'; // blue-700
  if (value >= 50) return '#2563eb'; // blue-600
  return '#3b82f6'; // blue-500
};

const getCompletionBadge = (value: number) => {
  if (value >= 80) return { label: 'Completo', variant: 'default' as const, icon: CheckCircle };
  if (value >= 50) return { label: 'Parcial', variant: 'secondary' as const, icon: Clock };
  return { label: 'Baixo', variant: 'destructive' as const, icon: AlertTriangle };
};

export const CompletionDashboard = ({ data }: CompletionDashboardProps) => {
  const { theme } = useTheme();
  const regionalStats = useMemo(() => {
    const map = new Map<string, { total: number; soma: number; completos: number; parcial: number; baixo: number }>();

    data.forEach(item => {
      const ug = item.unidade_gestora || 'Não informado';
      const pct = Math.min(parseFloat(item.percentual_preenchimento || '0') * 100, 100);
      
      const existing = map.get(ug) || { total: 0, soma: 0, completos: 0, parcial: 0, baixo: 0 };
      existing.total += 1;
      existing.soma += pct;
      if (pct >= 80) existing.completos += 1;
      else if (pct >= 50) existing.parcial += 1;
      else existing.baixo += 1;
      map.set(ug, existing);
    });

    return Array.from(map.entries())
      .map(([unidade, s]) => ({
        unidade: unidade.replace('SPRF/', ''),
        unidadeCompleta: unidade,
        totalImoveis: s.total,
        mediaPreenchimento: Math.round(s.soma / s.total),
        completosCount: s.completos,
        parcialCount: s.parcial,
        baixoCount: s.baixo,
      }))
      .sort((a, b) => a.mediaPreenchimento - b.mediaPreenchimento) as RegionalStats[];
  }, [data]);

  const globalStats = useMemo(() => {
    if (data.length === 0) return { media: 0, completos: 0, parcial: 0, baixo: 0 };
    const total = data.length;
    let soma = 0, completos = 0, parcial = 0, baixo = 0;
    data.forEach(item => {
      const pct = Math.min(parseFloat(item.percentual_preenchimento || '0') * 100, 100);
      soma += pct;
      if (pct >= 80) completos++;
      else if (pct >= 50) parcial++;
      else baixo++;
    });
    return { media: Math.round(soma / total), completos, parcial, baixo };
  }, [data]);

  const imageStats = useMemo(() => {
    if (data.length === 0) return { perField: [] as { label: string; count: number; pct: number }[], avgImages: 0 };
    const total = data.length;
    const perField = IMAGE_FIELDS.map(f => {
      const count = data.filter(item => item[f.key] && item[f.key] !== '').length;
      return { label: f.label, count, pct: Math.round((count / total) * 100) };
    });
    const totalImages = perField.reduce((s, f) => s + f.count, 0);
    const avgImages = Math.round((totalImages / (total * IMAGE_FIELDS.length)) * 100);
    return { perField, avgImages };
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-md text-sm">
        <p className="font-semibold text-foreground">{d.unidadeCompleta || d.unidade}</p>
        <p className="text-muted-foreground">Média: <span className="font-medium text-foreground">{d.mediaPreenchimento}%</span></p>
        <p className="text-muted-foreground">Imóveis: {d.totalImoveis}</p>
        <p className="text-green-600">Completos (≥80%): {d.completosCount}</p>
        <p className="text-yellow-600">Parciais (50-79%): {d.parcialCount}</p>
        <p className="text-red-600">Baixo (&lt;50%): {d.baixoCount}</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Média Global</p>
              <p className="text-3xl font-bold text-foreground">{globalStats.media}%</p>
              <Progress value={globalStats.media} className="mt-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Completos (≥80%)</p>
              <p className="text-3xl font-bold text-foreground">{globalStats.completos}</p>
              <p className="text-xs text-muted-foreground">{data.length > 0 ? ((globalStats.completos / data.length) * 100).toFixed(1) : 0}% dos imóveis</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Parciais (50-79%)</p>
              <p className="text-3xl font-bold text-foreground">{globalStats.parcial}</p>
              <p className="text-xs text-muted-foreground">{data.length > 0 ? ((globalStats.parcial / data.length) * 100).toFixed(1) : 0}% dos imóveis</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Baixo (&lt;50%)</p>
              <p className="text-3xl font-bold text-foreground">{globalStats.baixo}</p>
              <p className="text-xs text-muted-foreground">{data.length > 0 ? ((globalStats.baixo / data.length) * 100).toFixed(1) : 0}% dos imóveis</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Média de Preenchimento por Regional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalStats} layout="vertical" margin={{ left: 80, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="unidade" width={75} fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={80} stroke="hsl(var(--chart-1))" strokeDasharray="3 3" label={{ value: '80%', position: 'top', fontSize: 10 }} />
                <Bar dataKey="mediaPreenchimento" radius={[0, 4, 4, 0]}>
                  {regionalStats.map((entry, index) => (
                    <Cell key={index} fill={getCompletionColor(entry.mediaPreenchimento, theme)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhamento por Regional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Regional</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Imóveis</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Média</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">Completos</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">Parciais</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">Baixo</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {regionalStats.map((r, i) => {
                  const badge = getCompletionBadge(r.mediaPreenchimento);
                  const Icon = badge.icon;
                  return (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-2 px-3 font-medium text-foreground">{r.unidade}</td>
                      <td className="py-2 px-3 text-center text-foreground">{r.totalImoveis}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <Progress value={r.mediaPreenchimento} className="w-16 h-2" />
                          <span className="text-foreground font-medium">{r.mediaPreenchimento}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center text-green-600 hidden sm:table-cell">{r.completosCount}</td>
                      <td className="py-2 px-3 text-center text-yellow-600 hidden sm:table-cell">{r.parcialCount}</td>
                      <td className="py-2 px-3 text-center text-red-600 hidden sm:table-cell">{r.baixoCount}</td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant={badge.variant} className="gap-1">
                          <Icon className="h-3 w-3" />
                          {badge.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Image Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="h-5 w-5" />
            Preenchimento de Imagens
          </CardTitle>
          <p className="text-sm text-muted-foreground">Percentual de imóveis com cada tipo de imagem cadastrada</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">Média geral de imagens</span>
              <span className="text-sm font-bold text-foreground">{imageStats.avgImages}%</span>
            </div>
            <Progress value={imageStats.avgImages} className="h-3" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {imageStats.perField.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-md border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.count}/{data.length} imóveis</p>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={f.pct} className="w-16 h-2" />
                  <span className={`text-xs font-bold min-w-[3ch] text-right ${f.pct >= 80 ? 'text-green-600' : f.pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {f.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
