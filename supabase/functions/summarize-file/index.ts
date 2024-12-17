import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Function to split text into chunks of roughly equal size
function splitIntoChunks(text: string, maxChunkLength = 4000): string[] {
  const chunks: string[] = [];
  let currentChunk = "";
  
  // Split by sentences to maintain context
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      // If a single sentence is too long, split it
      if (sentence.length > maxChunkLength) {
        const words = sentence.split(' ');
        let tempChunk = "";
        for (const word of words) {
          if ((tempChunk + " " + word).length > maxChunkLength) {
            chunks.push(tempChunk.trim());
            tempChunk = word;
          } else {
            tempChunk += (tempChunk ? " " : "") + word;
          }
        }
        if (tempChunk) {
          currentChunk = tempChunk;
        }
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { fileName, fileContent, fileType } = await req.json();
    
    if (!fileName || !fileContent || !fileType) {
      throw new Error('Missing required fields');
    }

    console.log('Processing file:', fileName, 'Type:', fileType);

    // Decode base64 content
    const decoder = new TextDecoder();
    const binaryContent = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));
    const textContent = decoder.decode(binaryContent);

    if (!textContent || textContent.trim().length === 0) {
      throw new Error('No readable text content found in file');
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Split content into manageable chunks
    const chunks = splitIntoChunks(textContent);
    const summaries: string[] = [];

    // Process each chunk
    for (const chunk of chunks) {
      // Add delay between chunks to respect rate limits
      if (summaries.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un experto en resumir texto. Crea un resumen conciso del contenido proporcionado, enfocándote en los puntos clave e ideas principales. El resumen debe ser claro y fácil de entender."
          },
          {
            role: "user",
            content: `Por favor, resume el siguiente texto manteniendo los puntos más importantes:\n\n${chunk}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const summary = completion.choices[0]?.message?.content;
      if (summary) {
        summaries.push(summary);
      }
    }

    // If we have multiple summaries, create a final summary
    let finalSummary = summaries[0];
    if (summaries.length > 1) {
      const combinedSummary = summaries.join("\n\n");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un experto en resumir texto. Crea un resumen conciso y coherente combinando los siguientes resúmenes parciales."
          },
          {
            role: "user",
            content: `Por favor, combina los siguientes resúmenes en uno solo coherente:\n\n${combinedSummary}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      finalSummary = completion.choices[0]?.message?.content || summaries.join("\n\n");
    }

    console.log('Summary generated successfully');
    return new Response(
      JSON.stringify({ summary: finalSummary }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in summarize-file function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});