import { supabase } from "@/lib/supabase";

interface ProjectFile {
  name: string;
  url: string;
}

export async function analyzeProject(projectId: string, context: string, files: ProjectFile[], model: string) {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-project', {
      body: { context, files, model }
    });

    if (error) throw error;
    if (!data?.analysis) throw new Error('No analysis received from the API');

    // Store the analysis in the database
    const { error: dbError } = await supabase
      .from('project_analyses')
      .insert({
        project_id: projectId,
        analysis: data.analysis,
        model: model
      });

    if (dbError) throw dbError;

    return data.analysis;
  } catch (error) {
    console.error('Error in analyzeProject:', error);
    throw error;
  }
}