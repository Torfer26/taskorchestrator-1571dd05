import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting PDF processing...');
    
    // Get the file from the form data
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      console.error('No file provided');
      return new Response(
        JSON.stringify({ 
          error: 'INVALID_REQUEST', 
          message: 'No se proporcionó ningún archivo' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      console.error('File size exceeds limit');
      return new Response(
        JSON.stringify({ 
          error: 'FILE_TOO_LARGE', 
          message: 'El archivo excede el límite de 10MB' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get file content as ArrayBuffer and convert to Uint8Array for PDF.js
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let extractedText = '';

    try {
      console.log('Configuring PDF.js...');
      // Configure PDF.js for Deno environment
      globalThis.window = {
        pdfjsLib: pdfjs,
      };
      
      // Initialize PDF.js without worker
      pdfjs.GlobalWorkerOptions.workerSrc = '';
      
      console.log('Loading PDF document...');
      const loadingTask = pdfjs.getDocument({
        data: uint8Array,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/'
      });

      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully. Pages:', pdf.numPages);
      
      // Extract text from all pages
      const textContent = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Processing page ${pageNum}/${pdf.numPages}`);
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        textContent.push(strings.join(' '));
      }
      
      extractedText = textContent.join('\n');
      console.log('Text extraction successful, length:', extractedText.length);

      // Check if extracted text is empty
      if (extractedText.trim().length === 0) {
        console.log('No text content found in PDF');
        return new Response(
          JSON.stringify({
            error: 'SCANNED_PDF',
            message: 'El archivo PDF no contiene texto legible. Si es un documento escaneado, se requiere una integración con OCR externo.'
          }),
          { 
            status: 422,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Limit text to 5000 words for OpenAI
      const words = extractedText.split(/\s+/);
      if (words.length > 5000) {
        extractedText = words.slice(0, 5000).join(' ');
        console.log('Text truncated to 5000 words');
      }

      // Generate summary using OpenAI
      console.log('Generating summary with OpenAI...');
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente experto en crear resúmenes concisos y claros. Limita tus respuestas a 300 palabras.'
            },
            {
              role: 'user',
              content: `Por favor, genera un resumen del siguiente texto:\n\n${extractedText}`
            }
          ],
          max_tokens: 300,
        }),
      });

      if (!openAIResponse.ok) {
        console.error('OpenAI API error:', openAIResponse.status);
        throw new Error('Error al generar el resumen con OpenAI');
      }

      const data = await openAIResponse.json();
      const summary = data.choices[0].message.content;

      console.log('Summary generated successfully');
      return new Response(
        JSON.stringify({ summary }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );

    } catch (pdfError) {
      console.error('Error processing PDF:', pdfError);
      return new Response(
        JSON.stringify({ 
          error: 'PROCESSING_ERROR', 
          message: 'El archivo PDF está corrupto o protegido. Por favor, verifica y sube un archivo válido.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in process-document function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'SERVER_ERROR',
        message: 'Error interno del servidor al procesar el archivo. Por favor, inténtalo de nuevo.' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});