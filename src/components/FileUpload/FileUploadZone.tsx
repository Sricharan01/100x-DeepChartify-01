import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { FileWithPreview } from '../../types/fileTypes';

interface FileUploadZoneProps {
  onFilesAccepted: (files: FileWithPreview[]) => void;
}

const ACCEPTED_FILE_TYPES = {
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
  'text/plain': ['.txt'],
  'application/pdf': ['.pdf']
};

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFilesAccepted }) => {
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );
    onFilesAccepted(filesWithPreview);
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: true
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        w-full p-8 border-2 border-dashed rounded-lg cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${isDragReject ? 'border-red-500 bg-red-50' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        {isDragReject ? (
          <>
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-500">Some files are not supported</p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 text-blue-500" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-gray-500">
                or click to select files
              </p>
            </div>
            <div className="text-xs text-gray-400">
              Supported formats: CSV, XLS, XLSX, JSON, TXT, PDF
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploadZone;