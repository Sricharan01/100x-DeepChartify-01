import { AnalysisResult } from '../services/aiService';

const MAX_PROMPT_LENGTH = 500;
const MIN_PROMPT_LENGTH = 3;

export const validatePrompt = (prompt: string): string | null => {
  if (!prompt || typeof prompt !== 'string') {
    return 'Please provide a valid prompt';
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
    return 'Prompt is too short. Please be more specific.';
  }

  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return 'Prompt is too long. Please be more concise.';
  }

  return null;
};

export const parseAnalysisResponse = (text: string): AnalysisResult['insights'] => {
  // Remove any system-generated prefixes/suffixes
  let cleanedText = text
    .replace(/^(Assistant:|AI:|Analysis:|Here's your analysis:|Here is your analysis:)/i, '')
    .replace(/^[\s\n]+/, '')
    .replace(/\n*(\[end\]|\[done\]|\[complete\]|\[finished\])$/i, '')
    .trim();

  // Extract summary and key findings
  const sections = cleanedText.split(/\n(?=[A-Z][a-z]+ *:)/);
  
  const summary = extractSection(sections, ['Summary', 'Overview', 'Analysis'])
    || 'No summary available';

  const keyFindings = extractBulletPoints(sections, ['Key Findings', 'Findings', 'Main Points'])
    .filter(point => point.length > 0)
    .map(point => point.replace(/^[•\-\*]\s*/, ''));

  return {
    summary,
    keyFindings
  };
};

const extractSection = (sections: string[], headers: string[]): string => {
  for (const header of headers) {
    const section = sections.find(s => 
      s.toLowerCase().startsWith(header.toLowerCase())
    );
    
    if (section) {
      return section
        .replace(new RegExp(`^${header}:?`, 'i'), '')
        .trim();
    }
  }
  return '';
};

const extractBulletPoints = (sections: string[], headers: string[]): string[] => {
  for (const header of headers) {
    const section = sections.find(s => 
      s.toLowerCase().includes(header.toLowerCase())
    );
    
    if (section) {
      return section
        .split(/\n[•\-\*]|\n\d+\./)
        .slice(1)
        .map(point => point.trim())
        .filter(point => point.length > 0);
    }
  }
  return [];
};

export const validateAnalysisResult = (result: AnalysisResult): boolean => {
  if (!result?.insights) return false;
  
  const { insights } = result;
  
  return (
    typeof insights.summary === 'string' &&
    insights.summary.length > 0 &&
    Array.isArray(insights.keyFindings) &&
    insights.keyFindings.every(finding => typeof finding === 'string')
  );
};