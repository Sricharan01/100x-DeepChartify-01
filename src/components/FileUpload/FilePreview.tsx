import React from 'react';
import { FileWithPreview } from '../../types/fileTypes';
import { X, FileText, FileSpreadsheet } from 'lucide-react';

interface FilePreviewProps {
  files: FileWithPreview[];
  onRemove: (index: number) => void;
  progress?: { [key: string]: number };
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemove, progress = {} }) => {
  const getFileIcon = (type: string) => {
    if (type.includes('spreadsheet') || type.includes('csv')) {
      return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
    }
    return <FileText className="w-6 h-6 text-blue-500" />;
  };

  return (
    <div className="mt-4 space-y-2">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-3 flex-1">
            {getFileIcon(file.type)}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              {progress[index] !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress[index]}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => onRemove(index)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilePreview;