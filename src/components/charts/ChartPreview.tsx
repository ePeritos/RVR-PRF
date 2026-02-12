
import React, { useState, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartConfig } from '@/hooks/useChartData';
import { YearComparisonResult } from '@/hooks/useChartData';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ChartPreviewProps {
  data: any[];
  config: ChartConfig;
  comparisonData?: any[];
  yearComparisonData?: YearComparisonResult;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
];

const SIM_COLOR = '#22c55e';
const NAO_COLOR = '#ef4444';
const NI_COLOR = '#94a3b8';

export const ChartPreview = forwardRef<HTMLDivElement, ChartPreviewProps>(function ChartPreview({ data, config, comparisonData, yearComparisonData }, ref) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const displayData = config.type === 'comparison' ? (comparisonData || []) : data;

  // Para year_comparison, verificar dados separados
  if (config.type === 'year_comparison') {
    if (!yearComparisonData || !yearComparisonData.rows.length) {
      return (
        <Card className="flex-1" ref={ref}>
          <CardHeader>
            <CardTitle>{config.name || 'Evolução Temporal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              {yearComparisonData && yearComparisonData.years.length < 2
                ? 'Selecione mais de um ano nos filtros do dashboard para ver a evolução temporal'
                : 'Selecione os campos Sim/Não para visualizar a evolução temporal'}
            </div>
          </CardContent>
        </Card>
      );
    }
  } else if (!displayData.length) {
    return (
      <Card className="flex-1" ref={ref}>
        <CardHeader>
          <CardTitle>{config.name || 'Gráfico Personalizado'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            {config.type === 'comparison' 
              ? 'Selecione os campos Sim/Não para visualizar o comparativo'
              : 'Configure os campos para visualizar o gráfico'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const renderComparison = () => {
    const hasGroups = config.groupField && displayData.length > 0 && Object.keys(displayData[0]).some(k => k.includes('(Sim)'));
    
    if (hasGroups) {
      // Grouped comparison - multiple bars per group
      const dataKeys = Object.keys(displayData[0]).filter(k => k !== 'name');
      return (
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} layout="vertical" margin={{ left: 150 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={140} fontSize={11} />
              <Tooltip />
              <Legend />
              {dataKeys.map((key, idx) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={key.includes('(Sim)') ? COLORS[idx % COLORS.length] : `${COLORS[idx % COLORS.length]}80`}
                  stackId={key.replace(' (Sim)', '').replace(' (Não)', '')}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Simple Sim/Não comparison
    return (
      <div className="space-y-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} layout="vertical" margin={{ left: 160 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} fontSize={11} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sim" fill={SIM_COLOR} stackId="stack" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Não" fill={NAO_COLOR} stackId="stack" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Não informado" fill={NI_COLOR} stackId="stack" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Tabela resumo */}
        <div className="w-full border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">Campo {getSortIcon('name')}</div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('Sim')}>
                  <div className="flex items-center justify-end">Sim {getSortIcon('Sim')}</div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('Não')}>
                  <div className="flex items-center justify-end">Não {getSortIcon('Não')}</div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('percentSim')}>
                  <div className="flex items-center justify-end">% Sim {getSortIcon('percentSim')}</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...displayData].sort((a, b) => {
                if (!sortColumn) return 0;
                const aVal = a[sortColumn]; const bVal = b[sortColumn];
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                  return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                return sortDirection === 'asc' 
                  ? String(aVal).localeCompare(String(bVal), 'pt-BR')
                  : String(bVal).localeCompare(String(aVal), 'pt-BR');
              }).map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-sm">{row.name}</TableCell>
                  <TableCell className="text-right font-semibold" style={{ color: SIM_COLOR }}>{row.Sim}</TableCell>
                  <TableCell className="text-right font-semibold" style={{ color: NAO_COLOR }}>{row.Não}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${row.percentSim >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                      {row.percentSim}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderYearComparison = () => {
    if (!yearComparisonData) return null;
    const { years, rows } = yearComparisonData;
    const isDirectValues = rows.length > 0 && years[0] in rows[0]; // Sim/Não direto
    const isPctMode = rows.length > 0 && `${years[0]}_pct` in rows[0];

    const sortedRows = [...rows].sort((a, b) => {
      if (!sortColumn) return 0;
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal || '').localeCompare(String(bVal || ''), 'pt-BR')
        : String(bVal || '').localeCompare(String(aVal || ''), 'pt-BR');
    });

    const getTrendIcon = (trend: number) => {
      if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600 inline" />;
      if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500 inline" />;
      return <Minus className="h-4 w-4 text-muted-foreground inline" />;
    };

    if (isDirectValues) {
      // Modo direto: Sim/Não por unidade e ano
      return (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold cursor-pointer hover:bg-muted/50 sticky left-0 bg-background z-10" onClick={() => handleSort('name')}>
                  <div className="flex items-center">{config.groupField ? 'Unidade' : 'Campo'}{getSortIcon('name')}</div>
                </TableHead>
                {years.map(year => (
                  <TableHead key={year} className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort(year)}>
                    <div className="flex items-center justify-center font-bold">{year}{getSortIcon(year)}</div>
                  </TableHead>
                ))}
                <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort('_trend')}>
                  <div className="flex items-center justify-center">Tendência{getSortIcon('_trend')}</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-sm sticky left-0 bg-background">{row.name}</TableCell>
                  {years.map(year => {
                    const val = row[year];
                    const color = val === 'Sim' ? SIM_COLOR : val === 'Não' ? NAO_COLOR : undefined;
                    return (
                      <TableCell key={year} className="text-center font-semibold" style={{ color }}>
                        {val}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">{getTrendIcon(row._trend)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    // Modo percentual: Sim count e % por ano
    return (
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold cursor-pointer hover:bg-muted/50 sticky left-0 bg-background z-10" onClick={() => handleSort('name')}>
                <div className="flex items-center">{config.groupField ? 'Agrupamento' : 'Campo'}{getSortIcon('name')}</div>
              </TableHead>
              {years.map(year => (
                <React.Fragment key={year}>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort(`${year}_sim`)}>
                    <div className="flex items-center justify-end text-xs">{year} Sim{getSortIcon(`${year}_sim`)}</div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort(`${year}_pct`)}>
                    <div className="flex items-center justify-end text-xs">{year} %{getSortIcon(`${year}_pct`)}</div>
                  </TableHead>
                </React.Fragment>
              ))}
              <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => handleSort('_trend')}>
                <div className="flex items-center justify-center">Δ{getSortIcon('_trend')}</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium text-sm sticky left-0 bg-background">{row.name}</TableCell>
                {years.map(year => (
                  <React.Fragment key={year}>
                    <TableCell className="text-right text-sm">
                      {row[`${year}_sim`]}/{row[`${year}_total`]}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold text-sm ${row[`${year}_pct`] >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                        {row[`${year}_pct`]}%
                      </span>
                    </TableCell>
                  </React.Fragment>
                ))}
                <TableCell className="text-center">
                  <span className={`font-bold text-sm ${row._trend > 0 ? 'text-green-600' : row._trend < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {row._trend > 0 ? `+${row._trend}%` : row._trend < 0 ? `${row._trend}%` : '='} 
                  </span>
                  {' '}{getTrendIcon(row._trend)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderChart = () => {
    switch (config.type) {
      case 'comparison':
        return renderComparison();

      case 'year_comparison':
        return renderYearComparison();

      case 'table': {
        const columns = new Set<string>();
        data.forEach(row => {
          Object.keys(row).forEach(key => {
            if (key !== 'row' && key !== 'total') columns.add(key);
          });
        });
        const columnArray = Array.from(columns);
        
        const sortedData = [...data].sort((a, b) => {
          if (!sortColumn) return 0;
          let aVal: any, bVal: any;
          if (sortColumn === 'percentSim') {
            aVal = a.total > 0 && a['Sim'] != null ? (a['Sim'] / a.total) : -1;
            bVal = b.total > 0 && b['Sim'] != null ? (b['Sim'] / b.total) : -1;
          } else {
            aVal = sortColumn === 'row' ? a.row : sortColumn === 'total' ? a.total : a[sortColumn] || 0;
            bVal = sortColumn === 'row' ? b.row : sortColumn === 'total' ? b.total : b[sortColumn] || 0;
          }
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
          }
          return sortDirection === 'asc' 
            ? String(aVal).localeCompare(String(bVal), 'pt-BR')
            : String(bVal).localeCompare(String(aVal), 'pt-BR');
        });
        
        return (
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold cursor-pointer hover:bg-muted/50" onClick={() => handleSort('row')}>
                    <div className="flex items-center">{config.xField}{getSortIcon('row')}</div>
                  </TableHead>
                  {columnArray.map(col => (
                    <TableHead key={col} className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort(col)}>
                      <div className="flex items-center justify-end">{col}{getSortIcon(col)}</div>
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-bold cursor-pointer hover:bg-muted/50" onClick={() => handleSort('total')}>
                    <div className="flex items-center justify-end">Total{getSortIcon('total')}</div>
                  </TableHead>
                  {columnArray.includes('Sim') && (
                    <TableHead className="text-right font-bold cursor-pointer hover:bg-muted/50" onClick={() => handleSort('percentSim')}>
                      <div className="flex items-center justify-end">% Sim{getSortIcon('percentSim')}</div>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row, idx) => {
                  const percentSim = row.total > 0 && row['Sim'] != null ? Math.round((row['Sim'] / row.total) * 100) : null;
                  return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.row}</TableCell>
                    {columnArray.map(col => (
                      <TableCell key={col} className="text-right">{row[col] || 0}</TableCell>
                    ))}
                    <TableCell className="text-right font-bold">{row.total}</TableCell>
                    {columnArray.includes('Sim') && (
                      <TableCell className="text-right">
                        <span className={`font-semibold ${percentSim != null && percentSim >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                          {percentSim != null ? `${percentSim}%` : '-'}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      }
        
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" /><YAxis /><Tooltip />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" /><YAxis /><Tooltip />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
          </AreaChart>
        );

      default:
        return <div>Tipo de gráfico não suportado</div>;
    }
  };

  return (
    <Card className="flex-1" ref={ref}>
      <CardHeader>
        <CardTitle>{config.name || 'Visualização Personalizada'}</CardTitle>
      </CardHeader>
      <CardContent>
        {config.type === 'table' || config.type === 'comparison' || config.type === 'year_comparison' ? (
          renderChart()
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
