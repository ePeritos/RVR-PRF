
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

// Mock data for demonstration
const mockData = [
  { id: '1', nome: 'Obra Residencial A', categoria: 'Edificações', valor: 450000, data: '2024-01-15', status: 'ativo' },
  { id: '2', nome: 'Infraestrutura Vias', categoria: 'Infraestrutura', valor: 280000, data: '2024-02-10', status: 'concluido' },
  { id: '3', nome: 'Sistema Elétrico', categoria: 'Instalações', valor: 125000, data: '2024-01-20', status: 'pendente' },
  { id: '4', nome: 'Obra Comercial B', categoria: 'Edificações', valor: 680000, data: '2024-03-05', status: 'ativo' },
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
    
    if (filters.category) {
      filtered = filtered.filter(item => item.categoria === filters.category);
    }
    
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    setFilteredData(filtered);
    console.log('Filters applied:', filters);
  };

  const handleParameterSubmit = (parameters: any) => {
    // Mock calculation - in real app, this would use actual formulas
    const calculatedResults = filteredData
      .filter(item => selectedItems.includes(item.id))
      .map(item => {
        const valorAvaliado = item.valor * (1 + parameters.bdi / 100) * 1.15; // Mock calculation
        const diferenca = valorAvaliado - item.valor;
        const percentual = (diferenca / item.valor) * 100;
        
        return {
          id: item.id,
          nome: item.nome,
          categoria: item.categoria,
          valorOriginal: item.valor,
          valorAvaliado,
          diferenca,
          percentual
        };
      });
    
    setResults(calculatedResults);
    setCurrentStep(4);
    console.log('Parameters submitted:', parameters);
  };

  const handleViewPDF = (id: string) => {
    console.log('View PDF for item:', id);
    // In real app, this would open PDF viewer
  };

  const handleDownloadPDF = (id: string) => {
    console.log('Download PDF for item:', id);
    // In real app, this would download the PDF
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
                Etapa 1: Upload de Arquivo
              </h2>
              <p className="text-muted-foreground">
                Faça o upload da planilha contendo os dados das obras
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
                Etapa 2: Filtros e Seleção
              </h2>
              <p className="text-muted-foreground">
                Filtre os dados e selecione os itens para avaliação
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
                Etapa 3: Parâmetros de Avaliação
              </h2>
              <p className="text-muted-foreground">
                Insira os parâmetros necessários para o cálculo da avaliação
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
                Etapa 4: Resultados
              </h2>
              <p className="text-muted-foreground">
                Visualize os resultados da avaliação e gere relatórios em PDF
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
                Passo {currentStep} de 4
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
                Nova Avaliação
              </Button>
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
