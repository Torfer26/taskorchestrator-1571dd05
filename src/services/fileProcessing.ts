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
    
    const text = await response.text();
    if (!text.trim()) {
      throw new Error('File is empty');
    }
    
    const { data, error } = await supabase.functions.invoke('analyze-project', {
      body: { 
        context: text,
        model: "gpt-4o-mini"
      }
    });

    if (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
    if (!data?.analysis) {
      throw new Error('No analysis received from the API');
    }

    return { summary: data.analysis };
  } catch (error) {
    console.error('Error processing file:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}