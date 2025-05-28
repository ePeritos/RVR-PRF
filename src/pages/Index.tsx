
import { useState } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { StepContent } from '@/components/StepContent';
import { NavigationButtons } from '@/components/NavigationButtons';

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
  const [currentParameters, setCurrentParameters] = useState<any>(null);

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
    setCurrentParameters(parameters);
    
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
          percentual,
          areaImovel: item['Área construída (m²)'],
          situacaoImovel: item['Situação do imóvel'],
          unidadeGestora: item['Unidade Gestora'],
          anoCAIP: item['Ano CAIP']
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

  const handleNewEvaluation = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setSelectedItems([]);
    setResults([]);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <StepIndicator currentStep={currentStep} totalSteps={4} />

          <StepContent
            currentStep={currentStep}
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
            filteredData={filteredData}
            onFilterChange={handleFilterChange}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onParameterSubmit={handleParameterSubmit}
            results={results}
            onViewPDF={handleViewPDF}
            onDownloadPDF={handleDownloadPDF}
            currentParameters={currentParameters}
          />

          <NavigationButtons
            currentStep={currentStep}
            canProceed={canProceed()}
            onNextStep={nextStep}
            onPrevStep={prevStep}
            onNewEvaluation={handleNewEvaluation}
          />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
