import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function summarizeChunkWithRetry(chunk: string, retries = 3, initialDelay = 1000): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} of ${retries} to summarize chunk of length ${chunk.length}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-mini',
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error response:', errorData);
        
        if (errorData.error?.message?.includes('Rate limit reached')) {
          const waitTime = initialDelay * Math.pow(2, attempt);
          console.log(`Rate limit reached. Waiting ${waitTime}ms before retry...`);
          await sleep(waitTime);
          continue;
        }
        
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('OpenAI API response received');

      if (!data.choices?.[0]?.message?.content) {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid response structure from OpenAI API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Error in attempt ${attempt + 1}:`, error);
      
      if (attempt === retries - 1) {
        throw error;
      }
      
      const waitTime = initialDelay * Math.pow(2, attempt);
      console.log(`Error occurred. Waiting ${waitTime}ms before retry...`);
      await sleep(waitTime);
    }
  }
  
  throw new Error('Failed to summarize chunk after all retries');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request to summarize file');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file provided or invalid file format');
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

    // Split content into smaller chunks if needed
    const chunkSize = 2000;
    const chunks = [];
    for (let i = 0; i < fileContent.length; i += chunkSize) {
      chunks.push(fileContent.slice(i, i + chunkSize));
    }
    
    console.log(`Split content into ${chunks.length} chunks`);

    // Summarize each chunk
    const chunkSummaries = await Promise.all(
      chunks.map(chunk => summarizeChunkWithRetry(chunk))
    );

    // Combine summaries if needed
    let finalSummary = '';
    if (chunkSummaries.length > 1) {
      const combinedSummaries = chunkSummaries.join('\n\n');
      finalSummary = await summarizeChunkWithRetry(
        `Combine these summaries into one coherent summary:\n\n${combinedSummaries}`
      );
    } else if (chunkSummaries.length === 1) {
      finalSummary = chunkSummaries[0];
    } else {
      throw new Error('No summaries generated');
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