import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from "https://esm.sh/openai@4.20.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function chunkText(text: string, maxChunkSize: number = 2000): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function summarizeChunk(openai: OpenAI, text: string, chunkIndex: number): Promise<string> {
  // Add delay between chunks to respect rate limits
  if (chunkIndex > 0) {
    await delay(1000); // 1 second delay between chunks
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Summarize the following text in a very concise way, focusing only on the key points:"
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 300 // Reduced from 500
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error(`Error summarizing chunk ${chunkIndex}:`, error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl } = await req.json();
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the file content
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }
    const text = await response.text();

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Split text into smaller chunks and summarize each chunk
    const chunks = chunkText(text);
    console.log(`Processing document in ${chunks.length} chunks`);

    // Process chunks in sequence with delay
    const chunkSummaries = [];
    for (let i = 0; i < chunks.length; i++) {
      const summary = await summarizeChunk(openai, chunks[i], i);
      chunkSummaries.push(summary);
      console.log(`Processed chunk ${i + 1}/${chunks.length}`);
    }

    // Combine chunk summaries
    const combinedSummary = chunkSummaries.join('\n\n');
    
    // If combined summary is still too large, create a final summary
    let finalSummary = combinedSummary;
    if (combinedSummary.length > 2000) {
      await delay(1000); // Add delay before final summary
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Create a very concise final summary of these combined summaries, focusing on the most important points:"
          },
          {
            role: "user",
            content: combinedSummary
          }
        ],
        max_tokens: 300
      });
      finalSummary = finalCompletion.choices[0]?.message?.content || 'No se pudo generar un resumen';
    }

    return new Response(
      JSON.stringify({ summary: finalSummary }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});