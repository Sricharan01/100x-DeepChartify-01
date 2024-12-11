import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ProcessedFileData } from '../types/fileTypes';
import { parsePDFFile } from './pdfUtils';

export const processFiles = async (
  files: File[],
  onProgress?: (progress: number, index: number) => void
): Promise<ProcessedFileData[]> => {
  const processedFiles = await Promise.all(
    files.map(async (file, index) => {
      try {
        onProgress?.(0, index);
        const data = await parseFile(file, (progress) => onProgress?.(progress, index));
        onProgress?.(100, index);

        if (!data || !data.length) {
          throw new Error(`No valid data found in file ${file.name}`);
        }

        return {
          name: file.name,
          type: file.type,
          data: data.filter(row => Object.keys(row).length > 0),
          columns: Object.keys(data[0] || {})
        };
      } catch (error: any) {
        console.error(`Error processing ${file.name}:`, error);
        throw new Error(`Failed to process ${file.name}: ${error.message}`);
      }
    })
  );

  return processedFiles.filter((file): file is ProcessedFileData => 
    Boolean(file && file.data && file.data.length > 0)
  );
};

const parseFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<any[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'xlsx':
    case 'xls':
      return parseExcelFile(file);
    case 'csv':
      return parseCSVFile(file);
    case 'json':
      return parseJSONFile(file);
    case 'txt':
      return parseTextFile(file);
    case 'pdf':
      return parsePDFFile(file, onProgress);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
};

const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Combine data from all sheets
        const allData = workbook.SheetNames.reduce((acc, sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, {
            raw: false,
            defval: null,
            blankrows: false
          });
          return [...acc, ...jsonData];
        }, [] as any[]);

        resolve(allData);
      } catch (error: any) {
        reject(new Error(`Error parsing Excel file: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Error reading Excel file'));
    reader.readAsBinaryString(file);
  });
};

const parseCSVFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      transform: (value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          // Try to convert to number if possible
          const num = Number(trimmed);
          if (!isNaN(num)) {
            return num;
          }
          // Try to parse as date
          const date = new Date(trimmed);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
          return trimmed;
        }
        return value;
      },
      complete: (results) => {
        if (results.errors.length) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => reject(new Error(`CSV parsing error: ${error.message}`))
    });
  });
};

const parseJSONFile = async (file: File): Promise<any[]> => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error: any) {
    throw new Error(`Invalid JSON format: ${error.message}`);
  }
};

const parseTextFile = async (file: File): Promise<any[]> => {
  try {
    const text = await file.text();
    // Try to detect CSV-like content
    if (text.includes(',') || text.includes('\t')) {
      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          delimiter: text.includes(',') ? ',' : '\t',
          skipEmptyLines: 'greedy',
          complete: (results) => resolve(results.data),
          error: (error) => reject(error)
        });
      });
    }
    
    // Default to line-by-line parsing
    return text
      .split('\n')
      .map((line, index) => ({
        line: index + 1,
        content: line.trim()
      }))
      .filter(item => item.content);
  } catch (error: any) {
    throw new Error(`Error parsing text file: ${error.message}`);
  }
};