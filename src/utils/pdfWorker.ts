import { GlobalWorkerOptions } from 'pdfjs-dist';

export const initializePdfWorker = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
      console.log('PDF.js worker initialized successfully');
      resolve();
    } catch (error) {
      console.error('Failed to initialize PDF.js worker:', error);
      reject(error);
    }
  });
};