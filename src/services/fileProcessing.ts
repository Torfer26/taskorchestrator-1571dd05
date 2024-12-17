import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Configure the worker to use the bundled worker file
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

interface ProcessFileResponse {
  summary: string;
  text: string;
}

export async function processFile(fileUrl: string): Promise<ProcessFileResponse> {
  try {
    console.log('Processing file:', fileUrl);
    
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('No se pudo descargar el archivo');
    }

    const contentType = response.headers.get('content-type');
    
    if (!contentType) {
      throw new Error('No se pudo determinar el tipo de archivo');
    }

    // Handle PDF files
    if (contentType.includes('pdf')) {
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      // Create a summary (first 500 characters)
      const summary = fullText.substring(0, 500) + (fullText.length > 500 ? '...' : '');
      
      return {
        text: fullText,
        summary
      };
    }

    // Handle text files
    if (contentType.includes('text') || contentType.includes('plain')) {
      const text = await response.text();
      const summary = text.substring(0, 500) + (text.length > 500 ? '...' : '');
      
      return {
        text,
        summary
      };
    }
    
    // For DOCX files, we'll still inform the user that we need external processing
    if (contentType.includes('docx')) {
      throw new Error('Este archivo es un DOCX y necesita ser procesado externamente. Por favor, copie y pegue el texto manualmente.');
    }

    throw new Error('Tipo de archivo no soportado. Por favor, copie y pegue el texto manualmente.');
    
  } catch (error) {
    console.error('Error processing file:', error);
    throw error instanceof Error ? error : new Error('Error desconocido al procesar el archivo');
  }
}