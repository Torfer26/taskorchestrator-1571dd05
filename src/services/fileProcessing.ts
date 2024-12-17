import { supabase } from "@/lib/supabase";

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

    // For now, we'll only try to get text from text-based files
    if (contentType.includes('text') || contentType.includes('plain')) {
      const text = await response.text();
      const summary = text.substring(0, 500) + (text.length > 500 ? '...' : '');
      
      return {
        text,
        summary
      };
    }
    
    // For PDFs and DOCXs, we'll inform the user that we need external processing
    if (contentType.includes('pdf')) {
      throw new Error('Este archivo es un PDF y necesita ser procesado externamente. Por favor, copie y pegue el texto manualmente.');
    }
    
    if (contentType.includes('docx')) {
      throw new Error('Este archivo es un DOCX y necesita ser procesado externamente. Por favor, copie y pegue el texto manualmente.');
    }

    throw new Error('Tipo de archivo no soportado. Por favor, copie y pegue el texto manualmente.');
    
  } catch (error) {
    console.error('Error processing file:', error);
    throw error instanceof Error ? error : new Error('Error desconocido al procesar el archivo');
  }
}