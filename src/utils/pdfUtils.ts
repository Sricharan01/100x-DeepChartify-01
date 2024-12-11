import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

export const parsePDFFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<any[]> => {
  let worker;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const extractedData: any[] = [];
    
    // Initialize OCR worker
    worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        // Extract text content
        const textContent = await page.getTextContent();
        const textItems = processTextContent(textContent);

        // Render page for OCR if needed
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          await page.render({
            canvasContext: context,
            viewport
          }).promise;

          // Perform OCR if text content is minimal
          if (textItems.length < 5) {
            const { data: { text } } = await worker.recognize(canvas);
            const ocrItems = text.split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .map((text, index) => ({
                text,
                source: 'ocr',
                pageNumber: pageNum,
                index
              }));
            
            extractedData.push(...ocrItems);
          } else {
            extractedData.push(...textItems);
          }
        }

        onProgress?.(Math.round((pageNum / totalPages) * 100));
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError);
        continue;
      }
    }

    // Structure the extracted data
    return structureData(extractedData);
  } catch (error: any) {
    console.error('PDF Processing Error:', error);
    throw new Error(`Failed to process PDF: ${error.message}`);
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
};

const processTextContent = (textContent: any) => {
  return textContent.items
    .map((item: any) => ({
      text: item.str.trim(),
      x: Math.round(item.transform[4]),
      y: Math.round(item.transform[5]),
      fontSize: Math.round(item.transform[0]),
      width: item.width,
      height: item.height
    }))
    .filter(item => item.text.length > 0);
};

const structureData = (items: any[]): any[] => {
  // Try to detect tables
  const tables = detectTables(items);
  if (tables.length > 0) {
    return tables;
  }

  // Group text by vertical position
  const groupedItems = items.reduce((groups: any, item: any) => {
    const key = item.y ? Math.round(item.y / 20) * 20 : 0;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});

  // Convert to structured format
  return Object.entries(groupedItems)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([y, items]: [string, any[]]) => ({
      content: items
        .sort((a, b) => (a.x || 0) - (b.x || 0))
        .map(item => item.text)
        .join(' '),
      y: Number(y),
      pageNumber: items[0].pageNumber || 1
    }));
};

const detectTables = (items: any[]): any[] => {
  // Group items by vertical position with smaller threshold
  const rows = items.reduce((acc: any[], item: any) => {
    if (!item.y) return acc;
    
    const rowIndex = Math.round(item.y / 15); // Smaller threshold for better table detection
    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }
    acc[rowIndex].push(item);
    return acc;
  }, []);

  // Filter and sort rows
  const validRows = rows
    .filter(row => row && row.length > 1)
    .map(row => row.sort((a: any, b: any) => (a.x || 0) - (b.x || 0)));

  if (validRows.length < 2) return [];

  // Detect header row
  const headerRow = validRows[0].map((item: any) => item.text.trim());
  if (!isValidHeader(headerRow)) return [];

  // Process data rows
  return validRows.slice(1).map(row => {
    const rowData: Record<string, string> = {};
    headerRow.forEach((header, index) => {
      rowData[header] = row[index]?.text || '';
    });
    return rowData;
  });
};

const isValidHeader = (headers: string[]): boolean => {
  return headers.length > 1 && 
         headers.every(h => h.length > 0) &&
         !headers.some(h => h.length > 50) &&
         new Set(headers).size === headers.length;
};