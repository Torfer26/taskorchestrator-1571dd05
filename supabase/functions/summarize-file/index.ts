import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Request received, content-type:', req.headers.get('content-type'));
    
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
      // For all file types, we'll try to read the content as text
      fileContent = await file.text();
      console.log('Text extraction completed. Text length:', fileContent.length);
      
      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error('No readable text content found in file');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process file: ${error.message}`);
    }
    
    // Truncate content if too large (50k chars max)
    const maxChars = 50000;
    const truncatedContent = fileContent.slice(0, maxChars);
    
    console.log(`Content length: ${truncatedContent.length} chars`);

    // Call OpenAI API to generate summary using GPT-4
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente experto en resumir documentos. Tu tarea es:
1. Analizar el contenido del documento y extraer los puntos clave y la información más relevante.
2. Generar un resumen detallado y estructurado que capture la esencia del contenido.
3. Ignorar completamente los metadatos técnicos del archivo.
4. Enfocarte en el contenido real y su significado.
5. Si el documento está en un formato que no permite extraer contenido legible, indicarlo claramente.`
          },
          {
            role: 'user',
            content: truncatedContent
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      throw new Error(`Error in OpenAI API call: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ summary }),
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