import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from "https://esm.sh/openai@4.20.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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

    // Parse the request body
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

    // Generate summary using OpenAI
    console.log('Generating summary with OpenAI');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un experto en resumir texto. Crea un resumen conciso del contenido proporcionado, enfocándote en los puntos clave e ideas principales. El resumen debe ser claro y fácil de entender."
        },
        {
          role: "user",
          content: `Por favor, resume el siguiente texto manteniendo los puntos más importantes:\n\n${textContent}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('Summary generated successfully');
    const summary = completion.choices[0]?.message?.content || 'No se pudo generar un resumen';

    return new Response(
      JSON.stringify({ summary }),
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