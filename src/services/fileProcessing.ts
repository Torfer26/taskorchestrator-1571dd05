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

    console.log('Calling process-document function...');
    const { data, error } = await supabase.functions.invoke('process-document', {
      body: formData
    });

    if (error) {
      console.error('Edge function error:', error);
      // Check if it's a scanned PDF error
      if (error.message?.includes('SCANNED_PDF')) {
        throw new Error('SCANNED_PDF');
      }
      // If the error message is from our custom validation
      if (error.message?.includes('PDF no es válido')) {
        throw new Error(error.message);
      }
      throw new Error(`Analysis failed: ${error.message}`);
    }
    
    if (!data?.summary) {
      throw new Error('No summary received from the API');
    }

    return { summary: data.summary };
  } catch (error) {
    console.error('Error processing file:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}