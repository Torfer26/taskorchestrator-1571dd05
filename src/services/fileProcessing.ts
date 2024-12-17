import { supabase } from "@/lib/supabase";

interface ProcessFileResponse {
  summary: string;
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
    const formData = new FormData();
    formData.append('file', blob);

    // Call the new process-pdf function
    console.log('Calling process-pdf function...');
    const { data, error } = await supabase.functions.invoke('process-pdf', {
      body: formData
    });

    if (error) {
      console.error('Edge function error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('OCR')) {
        throw new Error('SCANNED_PDF');
      }
      throw error;
    }

    if (!data?.summary) {
      throw new Error('No se recibió un resumen del servicio');
    }

    return { summary: data.summary };
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Handle known error types
    if (error.message === 'SCANNED_PDF') {
      throw new Error('SCANNED_PDF');
    }
    
    throw error instanceof Error ? error : new Error('Error desconocido al procesar el archivo');
  }
}