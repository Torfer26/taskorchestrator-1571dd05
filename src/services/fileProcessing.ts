import { supabase } from "@/lib/supabase";

interface ProcessFileResponse {
  summary: string;
}

export async function processFile(fileUrl: string): Promise<ProcessFileResponse> {
  try {
    // Download the file content
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    const text = await response.text();
    
    // Call OpenAI API through our analyze-project function
    const { data, error } = await supabase.functions.invoke('analyze-project', {
      body: { 
        context: text,
        model: "gpt-4o-mini"
      }
    });

    if (error) throw error;
    if (!data?.analysis) throw new Error('No analysis received from the API');

    return { summary: data.analysis };
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
}