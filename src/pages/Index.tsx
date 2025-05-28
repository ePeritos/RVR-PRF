
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

// Mock data for demonstration - adjusted for real estate context using spreadsheet column names
interface DataRow {
  id: string;
  'Nome da unidade': string;
  'Tipo de unidade': string;
  'RVR': number;
  'Ano CAIP': string;
  'Situação do imóvel': string;
  'Área construída (m²)'?: number;
  'Unidade Gestora': string;
}

const mockData: DataRow[] = [
  { 
    id: '1', 
    'Nome da unidade': 'UOP Centro Cidade', 
    'Tipo de unidade': 'UOP', 
    'RVR': 450000, 
    'Ano CAIP': '2023', 
    'Situação do imóvel': 'próprio', 
    'Área construída (m²)': 120,
    'Unidade Gestora': 'SPRF/SP'
  },
  { 
    id: '2', 
    'Nome da unidade': 'Delegacia Regional Norte', 
    'Tipo de unidade': 'DEL', 
    'RVR': 280000, 
    'Ano CAIP': '2021', 
    'Situação do imóvel': 'alugado', 
    'Área construída (m²)': 150,
    'Unidade Gestora': 'SPRF/RJ'
  },
  { 
    id: '3', 
    'Nome da unidade': 'Sede Regional Sul', 
    'Tipo de unidade': 'SEDE REGIONAL', 
    'RVR': 125000, 
    'Ano CAIP': '2025', 
    'Situação do imóvel': 'cedido', 
    'Área construída (m²)': 300,
    'Unidade Gestora': 'SPRF/RS'
  },
  { 
    id: '4', 
    'Nome da unidade': 'UNIPRF Campinas', 
    'Tipo de unidade': 'UNIPRF', 
    'RVR': 680000, 
    'Ano CAIP': '2023', 
    'Situação do imóvel': 'próprio', 
    'Área construída (m²)': 95,
    'Unidade Gestora': 'UNIPRF/SC'
  },
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
    
    if (filters.anoCAIP) {
      filtered = filtered.filter(item => item['Ano CAIP'] === filters.anoCAIP);
    }
    
    if (filters.tipoUnidade) {
      filtered = filtered.filter(item => item['Tipo de unidade'] === filters.tipoUnidade);
    }
    
    if (filters.unidadeGestora) {
      filtered = filtered.filter(item => item['Unidade Gestora'] === filters.unidadeGestora);
    }
    
    setFilteredData(filtered);
    console.log('Filters applied:', filters);
  };

  const handleParameterSubmit = (parameters: any) => {
    // RVR calculation - using real estate evaluation parameters
    const calculatedResults = filteredData
      .filter(item => selectedItems.includes(item.id))
      .map(item => {
        // RVR calculation formula using area from spreadsheet data
        const areaImovel = item['Área construída (m²)'] || 100;
        const fatorLocalizacao = 1.1;
        const fatorMercado = 1.05;
        const valorRvr = (parameters.valorM2 * areaImovel) * fatorLocalizacao * fatorMercado * (1 + parameters.bdi / 100);
        const diferenca = valorRvr - item['RVR'];
        const percentual = (diferenca / item['RVR']) * 100;
        
        return {
          id: item.id,
          nome: item['Nome da unidade'],
          categoria: item['Tipo de unidade'],
          valorOriginal: item['RVR'],
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
        const selectedData = filteredData.filter(item => selectedItems.includes(item.id));
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
            <ParameterForm 
              onSubmit={handleParameterSubmit} 
              selectedData={selectedData}
            />
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
