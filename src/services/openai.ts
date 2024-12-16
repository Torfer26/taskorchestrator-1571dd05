import { supabase } from "@/lib/supabase";

interface ProjectFile {
  name: string;
  url: string;
}

export async function analyzeProject(context: string, files: ProjectFile[], model: string = 'gpt-4o-mini') {
  try {
    console.log('Calling analyze-project edge function...');
    const { data, error } = await supabase.functions.invoke('analyze-project', {
      body: { context, files, model }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message);
    }

    if (!data?.analysis) {
      throw new Error('No analysis received from the edge function');
    }

    return data.analysis;
  } catch (error) {
    console.error('Error in analyzeProject:', error);
    throw error;
  }
}