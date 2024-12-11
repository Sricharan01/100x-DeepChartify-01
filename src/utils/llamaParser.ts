import { LlamaIndex, SimpleDirectoryReader } from 'llamaindex';

const API_KEY = 'llx-nHCoowK0cHBRo8ur1bFQAXTMal9wCBpO45RRcknKziAt5kis';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class DocumentParser {
  private llama: LlamaIndex;
  
  constructor() {
    this.llama = new LlamaIndex({ apiKey: API_KEY });
  }

  private async validateApiKey(): Promise<boolean> {
    try {
      await this.llama.ping();
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async parseDocuments(files: File[]): Promise<any[]> {
    // Validate API key first
    const isValid = await this.validateApiKey();
    if (!isValid) {
      throw new Error('Invalid API key or authentication failed');
    }

    const results = [];
    let retryCount = 0;

    for (const file of files) {
      while (retryCount < MAX_RETRIES) {
        try {
          const reader = new SimpleDirectoryReader();
          const documents = await reader.loadData([file]);
          
          // Process each document
          const processedDoc = await this.llama.processDocument(documents[0]);
          results.push(processedDoc);
          break; // Success, move to next file
          
        } catch (error: any) {
          retryCount++;
          
          if (error.message.includes('rate limit')) {
            console.warn(`Rate limit hit, retrying in ${RETRY_DELAY}ms...`);
            await this.delay(RETRY_DELAY * retryCount); // Exponential backoff
            continue;
          }
          
          if (retryCount === MAX_RETRIES) {
            console.error(`Failed to process document after ${MAX_RETRIES} retries:`, error);
            throw new Error(`Document processing failed: ${error.message}`);
          }
        }
      }
      retryCount = 0; // Reset retry count for next file
    }

    return results;
  }

  async extractMetadata(documents: any[]): Promise<any[]> {
    return documents.map(doc => ({
      title: doc.metadata?.title || 'Untitled',
      author: doc.metadata?.author || 'Unknown',
      date: doc.metadata?.date || 'Unknown',
      type: doc.metadata?.type || 'Unknown',
      content: doc.text || '',
      pageCount: doc.metadata?.pageCount || 1,
    }));
  }
}

export const createDocumentParser = (): DocumentParser => {
  return new DocumentParser();
};