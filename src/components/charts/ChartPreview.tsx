
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartConfig } from '@/hooks/useChartData';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ChartPreviewProps {
  data: any[];
  config: ChartConfig;
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

export function ChartPreview({ data, config }: ChartPreviewProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  if (!data.length) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>{config.name || 'Gráfico Personalizado'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            Configure os campos para visualizar o gráfico
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
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const renderChart = () => {
    switch (config.type) {
      case 'table':
        if (!data.length) return <div>Sem dados para exibir</div>;
        
        // Obter todas as colunas únicas
        const columns = new Set<string>();
        data.forEach(row => {
          Object.keys(row).forEach(key => {
            if (key !== 'row' && key !== 'total') {
              columns.add(key);
            }
          });
        });
        const columnArray = Array.from(columns);
        
        // Ordenar os dados
        const sortedData = [...data].sort((a, b) => {
          if (!sortColumn) return 0;
          
          const aVal = sortColumn === 'row' ? a.row : 
                       sortColumn === 'total' ? a.total : 
                       a[sortColumn] || 0;
          const bVal = sortColumn === 'row' ? b.row : 
                       sortColumn === 'total' ? b.total : 
                       b[sortColumn] || 0;
          
          // Comparação numérica ou alfabética
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
          }
          
          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          
          if (sortDirection === 'asc') {
            return aStr.localeCompare(bStr, 'pt-BR');
          } else {
            return bStr.localeCompare(aStr, 'pt-BR');
          }
        });
        
        return (
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="font-bold cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('row')}
                  >
                    <div className="flex items-center">
                      {config.xField}
                      {getSortIcon('row')}
                    </div>
                  </TableHead>
                  {columnArray.map(col => (
                    <TableHead 
                      key={col} 
                      className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort(col)}
                    >
                      <div className="flex items-center justify-end">
                        {col}
                        {getSortIcon(col)}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead 
                    className="text-right font-bold cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center justify-end">
                      Total
                      {getSortIcon('total')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.row}</TableCell>
                    {columnArray.map(col => (
                      <TableCell key={col} className="text-right">
                        {row[col] || 0}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold">{row.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
        
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
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {data.map((entry, index) => (
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
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
          </AreaChart>
        );

      default:
        return <div>Tipo de gráfico não suportado</div>;
    }
  };

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>{config.name || 'Visualização Personalizada'}</CardTitle>
      </CardHeader>
      <CardContent>
        {config.type === 'table' ? (
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
}
