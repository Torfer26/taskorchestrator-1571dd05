import { supabase } from "@/lib/supabase";

interface ProcessFileResponse {
  summary: string;
  text: string;
}

export async function processFile(fileUrl: string): Promise<ProcessFileResponse> {
  try {
    console.log('Processing file:', fileUrl);
    
    const { data, error } = await supabase.functions.invoke('process-document', {
      body: { fileUrl }
    });

    if (error) throw error;
    
    return {
      summary: data.summary,
      text: data.text
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw error instanceof Error ? error : new Error('Error desconocido al procesar el archivo');
  }
}