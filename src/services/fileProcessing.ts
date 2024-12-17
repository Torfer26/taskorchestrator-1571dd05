import * as pdfjsLib from 'pdfjs-dist';
import { getDocument } from 'pdfjs-dist';

interface ProcessFileResponse {
  summary: string;
  text: string;
}

export async function processFile(fileUrl: string): Promise<ProcessFileResponse> {
  try {
    console.log('Downloading file from URL:', fileUrl);
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('El archivo está vacío');
    }

    console.log('File downloaded, size:', blob.size, 'bytes');
    
    // Convert blob to ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    // For now, we'll just return the text as both summary and text
    // In a real application, you'd want to implement a proper summarization logic
    return { 
      summary: fullText.substring(0, 500) + '...', // Simple summary: first 500 characters
      text: fullText 
    };
  } catch (error) {
    console.error('Error processing file:', error);
    
    if (error.message === 'SCANNED_PDF') {
      throw new Error('SCANNED_PDF');
    }
    
    throw error instanceof Error ? error : new Error('Error desconocido al procesar el archivo');
  }
}