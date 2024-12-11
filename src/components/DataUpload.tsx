import React, { useState, useRef } from 'react';
import { FileUp } from 'lucide-react';
import FileUploadZone from './FileUpload/FileUploadZone';
import FilePreview from './FileUpload/FilePreview';
import CustomPrompt from './CustomPrompt';
import AnalysisResults from './AnalysisResults';
import InteractiveGraphControls from './GraphControls/InteractiveGraphControls';
import ExportButton from './Export/ExportButton';
import { FileWithPreview, ProcessedFileData } from '../types/fileTypes';
import { processFiles } from '../utils/fileProcessing';
import { analyzeData, AnalysisResult } from '../services/aiService';

const DataUpload: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedFileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult>();
  const chartsContainerRef = useRef<HTMLDivElement>(null);

  const handleFilesAccepted = (acceptedFiles: FileWithPreview[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError('');
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setProcessedData(prev => prev.filter((_, i) => i !== index));
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const handleCustomPrompt = async (prompt: string) => {
    if (!processedData.length) {
      setError('Please process some files first');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const result = await analyzeData(processedData, prompt);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleProcessFiles = async () => {
    if (!files.length) return;

    setLoading(true);
    setError('');
    setAnalysis(undefined);

    try {
      const results = await processFiles(files, (progress, index) => {
        setProgress(prev => ({
          ...prev,
          [index]: progress
        }));
      });

      setProcessedData(results);

      // Initial analysis after processing
      const result = await analyzeData(results, 'Provide an overview of the data');
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Error processing files');
    } finally {
      setLoading(false);
    }
  };

  // Combine all processed data for visualization
  const combinedData = processedData.reduce((acc, curr) => [...acc, ...curr.data], []);
  const allColumns = Array.from(new Set(processedData.flatMap(d => d.columns)));

  return (
    <section id="upload" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Upload Your Data Files
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">
          Upload multiple files for comprehensive analysis
        </p>

        <div className="max-w-4xl mx-auto space-y-8">
          <FileUploadZone onFilesAccepted={handleFilesAccepted} />
          
          {files.length > 0 && (
            <>
              <FilePreview 
                files={files}
                onRemove={handleFileRemove}
                progress={progress}
              />

              <div className="flex justify-center">
                <button
                  onClick={handleProcessFiles}
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <FileUp className="mr-2 h-5 w-5" />
                  {loading ? 'Processing...' : 'Process Files'}
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {processedData.length > 0 && (
            <>
              <CustomPrompt onSubmit={handleCustomPrompt} loading={analyzing} />
              
              {analysis && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Analysis Results</h3>
                    <ExportButton 
                      analysis={analysis}
                      data={combinedData}
                      chartRef={chartsContainerRef}
                    />
                  </div>
                  <AnalysisResults analysis={analysis} />
                </div>
              )}

              <div ref={chartsContainerRef}>
                <InteractiveGraphControls
                  data={combinedData}
                  columns={allColumns}
                  loading={loading || analyzing}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default DataUpload;