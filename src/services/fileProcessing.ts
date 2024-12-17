import { supabase } from "@/lib/supabase";

interface ProcessFileResponse {
  summary: string;
}

const BACKEND_URL = 'https://tu-backend.herokuapp.com'; // Reemplaza con tu URL real

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

    // Llamada al nuevo backend personalizado
    console.log('Calling custom backend for PDF processing...');
    const processResponse = await fetch(`${BACKEND_URL}/process-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!processResponse.ok) {
      const errorData = await processResponse.json();
      console.error('Backend processing error:', errorData);
      
      // Manejo específico de errores
      if (processResponse.status === 400) {
        if (errorData.error.includes('no contiene texto legible')) {
          throw new Error('SCANNED_PDF');
        }
        throw new Error(errorData.error);
      }
      
      throw new Error('Error procesando el archivo');
    }

    const data = await processResponse.json();
    
    if (!data?.summary) {
      throw new Error('No summary received from the backend');
    }

    return { summary: data.summary };
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Manejo específico de errores conocidos
    if (error.message === 'SCANNED_PDF') {
      throw new Error('SCANNED_PDF');
    }
    
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}