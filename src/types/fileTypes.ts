export interface FileWithPreview extends File {
  preview: string;
}

export interface ProcessedFileData {
  name: string;
  type: string;
  data: any[];
  columns: string[];
}

export interface ChartData {
  type: string;
  data: any[];
  columns: string[];
  fileName: string;
}

export interface WatermarkOptions {
  text: string;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  opacity: number;
  fontSize: number;
  fontFamily: string;
}