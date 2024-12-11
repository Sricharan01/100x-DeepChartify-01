import { AnalysisResult } from '../services/aiService';

export const parseAnalysisResponse = (text: string): AnalysisResult['insights'] => {
  // Split text into sections based on headers
  const sections = text.split(/\n(?=[A-Z][a-z]+ *:)/);
  
  // Get unique sections for each category
  const uniqueSections = {
    summary: getUniqueSections(sections, ['Summary', 'Overview']),
    // keyFindings: getUniqueBulletPoints(sections, ['Key Findings', 'Findings', 'Main Discoveries']),
    recommendations: getUniqueBulletPoints(sections, ['Recommendations', 'Suggestions', 'Next Steps'])
  };

  return {
    summary: uniqueSections.summary || 'No summary available',
    keyFindings: uniqueSections.keyFindings,
    recommendations: uniqueSections.recommendations
  };
};

const getUniqueSections = (sections: string[], headers: string[]): string => {
  for (const header of headers) {
    const content = extractSection(sections, header);
    if (content) return content;
  }
  return '';
};

const getUniqueBulletPoints = (sections: string[], headers: string[]): string[] => {
  const allPoints = new Set<string>();
  
  for (const header of headers) {
    const points = extractBulletPoints(sections, header);
    points.forEach(point => allPoints.add(point.toLowerCase()));
  }

  return Array.from(allPoints)
    .map(point => point.charAt(0).toUpperCase() + point.slice(1));
};

const extractSection = (sections: string[], header: string): string => {
  const section = sections.find(s => 
    s.toLowerCase().includes(header.toLowerCase())
  );
  
  if (!section) return '';
  
  return section
    .replace(new RegExp(`${header}:?`, 'i'), '')
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.match(/^[A-Z][a-z]+ *:/))
    .join('\n');
};

const extractBulletPoints = (sections: string[], header: string): string[] => {
  const section = extractSection(sections, header);
  if (!section) return [];
  
  return section
    .split(/\n-|\n•|\n\d+\./)
    .map(point => point.trim())
    .filter(point => point.length > 0)
    .map(point => point
      .replace(/^[-•]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim()
    );
};

export const validateAnalysisResult = (result: AnalysisResult): boolean => {
  if (!result.insights) return false;
  
  const { insights } = result;
  
  // Check if at least summary or key findings are present
  if (!insights.summary && (!insights.keyFindings || insights.keyFindings.length === 0)) {
    return false;
  }
  
  // Validate that all arrays are properly formed
  const arrays = ['keyFindings', 'recommendations'];
  return arrays.every(key => 
    !insights[key] || (Array.isArray(insights[key]) && insights[key].every(item => typeof item === 'string'))
  );
};