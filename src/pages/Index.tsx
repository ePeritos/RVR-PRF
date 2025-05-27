import { useState } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import { Header } from '@/components/Header';
import { FileUpload } from '@/components/FileUpload';
import { DataFilter } from '@/components/DataFilter';
import { DataTable } from '@/components/DataTable';
import { ParameterForm } from '@/components/ParameterForm';
import { ResultsTable } from '@/components/ResultsTable';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data for demonstration - adjusted for real estate context
const mockData = [
  { id: '1', nome: 'Imóvel Residencial Centro', categoria: 'Residencial', valor: 450000, data: '2024-01-15', status: 'ativo' },
  { id: '2', nome: 'Terreno Comercial BR-101', categoria: 'Comercial', valor: 280000, data: '2024-02-10', status: 'concluido' },
  { id: '3', nome: 'Galpão Industrial', categoria: 'Industrial', valor: 125000, data: '2024-01-20', status: 'pendente' },
  { id: '4', nome: 'Apartamento Zona Sul', categoria: 'Residencial', valor: 680000, data: '2024-03-05', status: 'ativo' },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState(mockData);
  const [results, setResults] = useState<any[]>([]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    console.log('File uploaded:', file.name);
  };

  const handleFilterChange = (filters: any) => {
    let filtered = mockData;
    
    if (filters.search) {
      filtered = filtered.filter(item => 
        item.nome.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.anoCAIP) {
      // Filtrar por ano CAIP - assumindo que a data contém o ano
      filtered = filtered.filter(item => item.data.includes(filters.anoCAIP));
    }
    
    if (filters.tipoUnidade) {
      // Mapear categoria para tipo de unidade
      const categoryMap: Record<string, string> = {
        'residencial': 'Residencial',
        'comercial': 'Comercial', 
        'industrial': 'Industrial',
        'misto': 'Misto'
      };
      filtered = filtered.filter(item => item.categoria === categoryMap[filters.tipoUnidade]);
    }
    
    if (filters.unidadeGestora) {
      // Para demonstração, filtrar por uma propriedade simulada
      // Em um app real, isso viria dos dados da planilha
      console.log('Filtrando por unidade gestora:', filters.unidadeGestora);
    }
    
    setFilteredData(filtered);
    console.log('Filters applied:', filters);
  };

  const handleParameterSubmit = (parameters: any) => {
    // RVR calculation - using real estate evaluation parameters
    const calculatedResults = filteredData
      .filter(item => selectedItems.includes(item.id))
      .map(item => {
        // RVR calculation formula (simplified example)
        const fatorLocalizacao = 1.1; // Factor based on location
        const fatorMercado = 1.05; // Market factor
        const valorRvr = (parameters.valorM2 * parameters.area || item.valor) * fatorLocalizacao * fatorMercado * (1 + parameters.bdi / 100);
        const diferenca = valorRvr - item.valor;
        const percentual = (diferenca / item.valor) * 100;
        
        return {
          id: item.id,
          nome: item.nome,
          categoria: item.categoria,
          valorOriginal: item.valor,
          valorAvaliado: valorRvr,
          diferenca,
          percentual
        };
      });
    
    setResults(calculatedResults);
    setCurrentStep(4);
    console.log('RVR Parameters submitted:', parameters);
  };

  const handleViewPDF = (id: string) => {
    console.log('View RVR PDF for property:', id);
    // In real app, this would open RVR PDF viewer
  };

  const handleDownloadPDF = (id: string) => {
    console.log('Download RVR PDF for property:', id);
    // In real app, this would download the RVR PDF
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return uploadedFile !== null;
      case 2: return selectedItems.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Etapa 1: Upload da Base de Dados
              </h2>
              <p className="text-muted-foreground">
                Faça o upload da planilha contendo os dados dos imóveis para avaliação RVR
              </p>
            </div>
            <FileUpload onFileUpload={handleFileUpload} uploadedFile={uploadedFile} />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Etapa 2: Seleção de Imóveis
              </h2>
              <p className="text-muted-foreground">
                Filtre e selecione os imóveis que serão incluídos no Relatório de Valor Referencial
              </p>
            </div>
            <DataFilter onFilterChange={handleFilterChange} />
            <DataTable 
              data={filteredData} 
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
            />
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Etapa 3: Parâmetros RVR
              </h2>
              <p className="text-muted-foreground">
                Configure os parâmetros técnicos para geração do Relatório de Valor Referencial
              </p>
            </div>
            <ParameterForm onSubmit={handleParameterSubmit} />
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Etapa 4: Relatório RVR
              </h2>
              <p className="text-muted-foreground">
                Visualize os resultados da avaliação e gere os Relatórios de Valor Referencial em PDF
              </p>
            </div>
            <ResultsTable 
              results={results}
              onViewPDF={handleViewPDF}
              onDownloadPDF={handleDownloadPDF}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-center items-center space-x-4 mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : step < currentStep 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-0.5 mx-2 transition-colors ${
                      step < currentStep ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Passo {currentStep} de 4 - Processo RVR
              </p>
            </div>
          </div>

          {/* Step Content */}
          <div className="animate-fade-in">
            {renderStep()}
          </div>

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 1}
                className="hover-scale"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              
              <Button 
                onClick={nextStep} 
                disabled={!canProceed()}
                className="hover-scale"
              >
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentStep(1);
                  setUploadedFile(null);
                  setSelectedItems([]);
                  setResults([]);
                }}
                className="hover-scale"
              >
                Nova Avaliação RVR
              </Button>
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
