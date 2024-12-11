import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, PageBreak, HeightRule, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { AnalysisResult } from '../types/analysisTypes';

// Utility function to clean text (remove markdown-like elements)
const cleanText = (text: string): string => {
  return text
    .replace(/^\s*[\*\-]\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .trim();
};

export const exportToPDF = async (
  analysis: AnalysisResult,
  chartRef: React.RefObject<HTMLDivElement>
): Promise<void> => {
  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const maxWidth = pageWidth - (2 * margin);

  // Reset y offset
  let yOffset = margin;

  // Add title
  pdf.setFontSize(16);
  pdf.text('Data Analysis Report', margin, yOffset, { align: 'left' });
  yOffset += 10;

  // Utility function to add text with page break management
  const addTextSection = (title: string, content: string | string[]) => {
    // Check if we need a new page
    if (yOffset > pageHeight - 30) {
      pdf.addPage();
      yOffset = margin;
    }

    // Add section title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(title, margin, yOffset);
    yOffset += 10;

    // Reset to normal font
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);

    // Process content (array or string)
    const textContent = Array.isArray(content) 
      ? content.map(item => cleanText(item)).join('\n') 
      : cleanText(content);

    // Split text to fit within page width
    const splitText = pdf.splitTextToSize(textContent, maxWidth);
    
    // Add text, managing page breaks
    splitText.forEach((line: string) => {
      if (yOffset > pageHeight - 10) {
        pdf.addPage();
        yOffset = margin;
      }
      pdf.text(line, margin, yOffset);
      yOffset += 7;
    });

    // Add some spacing
    yOffset += 5;
  };

  // Add sections
  if (analysis.insights.summary) {
    addTextSection('Summary', analysis.insights.summary);
  }

  ['keyFindings', 'trends', 'recommendations'].forEach(section => {
    if (analysis.insights[section]?.length) {
      addTextSection(
        section.charAt(0).toUpperCase() + section.slice(1),
        analysis.insights[section] as string[]
      );
    }
  });

  // Add chart
  if (chartRef.current) {
    // Add a new page for the chart
    pdf.addPage();
    
    // Capture chart at full resolution
    const canvas = await html2canvas(chartRef.current, { 
      scale: 2, // Increase scale for better quality
      useCORS: true 
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate image dimensions to fit the page
    const imgProps = pdf.getImageProperties(imgData);
    const imageWidth = pageWidth - (2 * margin);
    const imageHeight = (imgProps.height / imgProps.width) * imageWidth;
    
    // Add image centered on the page
    pdf.addImage(
      imgData, 
      'PNG', 
      margin, 
      margin, 
      imageWidth, 
      imageHeight
    );
  }

  pdf.save('data-analysis-report.pdf');
};

export const exportToDocx = async (
  analysis: AnalysisResult,
  data: any[]
): Promise<void> => {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 720,    // 0.5 inch
            right: 720,  // 0.5 inch
            bottom: 720, // 0.5 inch
            left: 720,   // 0.5 inch
          }
        }
      },
      children: [
        // Title
        new Paragraph({
          children: [
            new TextRun({
              text: 'Data Analysis Report',
              bold: true,
              size: 32
            })
          ],
          pageBreakBefore: true
        }),

        // Sections
        ...Object.entries(analysis.insights).flatMap(([section, content]) => {
          if (!content) return [];
          
          return [
            // Page break before each main section
            new Paragraph({ children: [new PageBreak()] }),
            
            // Section title
            new Paragraph({
              children: [
                new TextRun({
                  text: section.charAt(0).toUpperCase() + section.slice(1),
                  bold: true,
                  size: 28
                })
              ]
            }),

            // Section content
            ...(Array.isArray(content) 
              ? content.map(item => new Paragraph({
                  children: [new TextRun({ 
                    text: cleanText(item),
                    size: 24
                  })]
                }))
              : [new Paragraph({
                  children: [new TextRun({ 
                    text: cleanText(content as string),
                    size: 24
                  })]
                })]
            )
          ];
        })
      ]
    }]
  });
  
  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'data-analysis-report.docx');
};

export const exportToImage = async (
  chartRef: React.RefObject<HTMLDivElement>
): Promise<void> => {
  if (!chartRef.current) return;
  
  // Use high-resolution canvas capture
  const canvas = await html2canvas(chartRef.current, { 
    scale: 3,  // Higher scale for better quality
    useCORS: true,
    logging: false
  });
  
  // Convert to high-quality blob
  canvas.toBlob(blob => {
    if (blob) {
      saveAs(blob, 'data-analysis-charts.png');
    }
  }, 'image/png', 1);  // Highest quality PNG
};

export const exportToJSON = async (
  analysis: AnalysisResult,
  data: any[]
): Promise<void> => {
  const exportData = {
    analysis,
    data,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  
  saveAs(blob, 'data-analysis-report.json');
};