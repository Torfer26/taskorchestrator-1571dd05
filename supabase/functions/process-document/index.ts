import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from "https://esm.sh/openai@4.20.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function chunkText(text: string, maxChunkSize: number = 4000): string[] {
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

async function summarizeChunk(openai: OpenAI, text: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that summarizes documents. Provide a concise summary of the following text:"
      },
      {
        role: "user",
        content: text
      }
    ],
    max_tokens: 500
  });

  return completion.choices[0]?.message?.content || '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileUrl } = await req.json()
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch the file content
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch file')
    }
    const text = await response.text()

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // Split text into chunks and summarize each chunk
    const chunks = chunkText(text);
    console.log(`Processing document in ${chunks.length} chunks`);

    const chunkSummaries = await Promise.all(
      chunks.map(chunk => summarizeChunk(openai, chunk))
    );

    // Combine chunk summaries into a final summary
    const combinedSummary = chunkSummaries.join('\n\n');
    
    // If the combined summary is still large, summarize it again
    let finalSummary = combinedSummary;
    if (combinedSummary.length > 4000) {
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Create a concise final summary of these combined summaries:"
          },
          {
            role: "user",
            content: combinedSummary
          }
        ],
        max_tokens: 500
      });
      finalSummary = finalCompletion.choices[0]?.message?.content || 'No se pudo generar un resumen';
    }

    return new Response(
      JSON.stringify({ summary: finalSummary }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})