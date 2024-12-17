interface ProcessFileResponse {
  summary: string;
  text: string;
}

// Cambiamos a la URL pública de tu servidor Flask
const FLASK_BACKEND_URL = 'https://tu-servidor-flask.com'; // TODO: Actualiza esta URL con tu servidor real

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

    // Call Flask backend
    const processResponse = await fetch(`${FLASK_BACKEND_URL}/process-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!processResponse.ok) {
      const error = await processResponse.json();
      if (error.error === 'PDF_REQUIRES_OCR') {
        throw new Error('SCANNED_PDF');
      }
      throw new Error(error.error || 'Error procesando el archivo');
    }

    const data = await processResponse.json();
    if (!data?.summary || !data?.text) {
      throw new Error('No se recibió la respuesta esperada del servicio');
    }

    return { 
      summary: data.summary,
      text: data.text 
    };
  } catch (error) {
    console.error('Error processing file:', error);
    
    if (error.message === 'SCANNED_PDF') {
      throw new Error('SCANNED_PDF');
    }
    
    throw error instanceof Error ? error : new Error('Error desconocido al procesar el archivo');
  }
}