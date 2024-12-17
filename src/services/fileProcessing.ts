import { supabase } from "@/lib/supabase";

interface ProcessFileResponse {
  summary: string;
}

export async function processFile(fileUrl: string): Promise<ProcessFileResponse> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob);

    const { data, error } = await supabase.functions.invoke('process-document', {
      body: formData
    });

    if (error) {
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