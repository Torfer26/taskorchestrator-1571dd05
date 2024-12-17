import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument } from 'npm:pdf-lib';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      throw new Error('No se proporcionó un archivo PDF válido');
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load and validate PDF
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer);
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('El archivo PDF está corrupto o protegido. Por favor, verifica y sube un archivo válido.');
    }

    // Extract text from all pages
    let extractedText = '';
    const pages = pdfDoc.getPages();
    
    for (const page of pages) {
      const text = await page.doc.getText();
      if (text) extractedText += text + '\n';
    }

    // Check if we got any text
    if (!extractedText.trim()) {
      throw new Error('El archivo PDF no contiene texto legible. Si es un documento escaneado, se requiere una integración con OCR externo.');
    }

    // Limit text to 5000 words
    const words = extractedText.split(/\s+/);
    if (words.length > 5000) {
      extractedText = words.slice(0, 5000).join(' ');
    }

    // Generate summary with OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Genera un resumen conciso y claro del siguiente texto, manteniendo los puntos más importantes.'
          },
          {
            role: 'user',
            content: extractedText
          }
        ],
        max_tokens: 300,
        temperature: 0.5
      })
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error('OpenAI API error:', error);
      throw new Error('Error al generar el resumen con OpenAI');
    }

    const openAIData = await openAIResponse.json();
    const summary = openAIData.choices[0].message.content;

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
    console.error('Error in process-pdf function:', error);
    
    // Determine if it's a known error type
    const isKnownError = error.message.includes('corrupto') || 
                        error.message.includes('OCR') ||
                        error.message.includes('OpenAI');
    
    return new Response(
      JSON.stringify({
        error: isKnownError ? error.message : 'Error procesando el archivo',
        details: error.message
      }),
      { 
        status: isKnownError ? 400 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});