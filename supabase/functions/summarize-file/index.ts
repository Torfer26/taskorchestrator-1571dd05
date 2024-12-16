import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function summarizeChunk(chunk: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at summarizing text. Create a concise summary of the provided content, focusing on key points and main ideas.'
        },
        { role: 'user', content: chunk }
      ],
      temperature: 0.7,
      max_tokens: 500
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!req.body) {
      throw new Error('No request body provided');
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file provided');
    }

    console.log('Processing file:', file.name, 'Type:', file.type);

    // Extract text content from the file
    let fileContent = '';
    try {
      fileContent = await file.text();
      console.log('Text extraction completed. Text length:', fileContent.length);
      
      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error('No readable text content found in file');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process file: ${error.message}`);
    }

    // Split content into chunks of roughly 2000 characters
    // This ensures we stay well within token limits
    const chunkSize = 2000;
    const chunks = [];
    for (let i = 0; i < fileContent.length; i += chunkSize) {
      chunks.push(fileContent.slice(i, i + chunkSize));
    }
    
    console.log(`Split content into ${chunks.length} chunks`);

    // Summarize each chunk
    const chunkSummaries = await Promise.all(
      chunks.map(chunk => summarizeChunk(chunk))
    );

    // If we have multiple summaries, combine them with another API call
    let finalSummary = '';
    if (chunkSummaries.length > 1) {
      const combinedSummaries = chunkSummaries.join('\n\n');
      finalSummary = await summarizeChunk(
        `Combine these summaries into one coherent summary:\n\n${combinedSummaries}`
      );
    } else {
      finalSummary = chunkSummaries[0];
    }

    return new Response(
      JSON.stringify({ summary: finalSummary }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in summarize-file function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }
      }
    );
  }
});