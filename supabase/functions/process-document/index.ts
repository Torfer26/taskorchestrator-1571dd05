import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are supported');
    }

    console.log('Processing file:', file.name, 'Size:', file.size);

    // Get file content as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    let extractedText = '';

    try {
      // Initialize PDF.js worker
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      
      // Load the PDF document with better error handling
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      });

      console.log('Loading PDF document...');
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

      // Check if extracted text is too short or empty
      if (extractedText.trim().length < 100) {
        return new Response(
          JSON.stringify({
            error: 'SCANNED_PDF',
            message: 'Este archivo parece ser escaneado o no contiene texto seleccionable. Para procesar este tipo de archivos, necesitarás integrar un servicio OCR.'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 422
          }
        );
      }

      // Generate summary using OpenAI
      console.log('Generating summary with OpenAI...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API error:', response.status, await response.text());
        throw new Error('Failed to generate summary with OpenAI');
      }

      const data = await response.json();
      const summary = data.choices[0].message.content;

      return new Response(
        JSON.stringify({ summary }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );

    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Could not process the PDF file. Please ensure it is not corrupted or password protected.');
    }

  } catch (error) {
    console.error('Error in process-document function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message.includes('SCANNED_PDF') ? 'SCANNED_PDF' : 'PROCESSING_ERROR',
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('SCANNED_PDF') ? 422 : 500
      }
    );
  }
});