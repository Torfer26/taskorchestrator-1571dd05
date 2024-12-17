import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';

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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Ensure we're getting form data
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      throw new Error('Expected multipart/form-data');
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Processing file:', file.name);

    // Get file content as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    let extractedText = '';

    if (file.type === 'application/pdf') {
      try {
        // Try to extract text from PDF using pdf-lib
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        
        for (const page of pages) {
          const text = await page.getTextContent();
          extractedText += text + '\n';
        }

        console.log('Successfully extracted text from PDF');
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Could not extract text from PDF. The file might be scanned or protected.');
      }
    } else {
      // For non-PDF files (e.g., DOCX), use text decoder
      extractedText = new TextDecoder().decode(arrayBuffer);
    }

    if (!extractedText.trim()) {
      throw new Error('No text could be extracted from the file');
    }

    console.log('Extracted text length:', extractedText.length);

    // Limit text to approximately 4000 tokens (roughly 16000 characters)
    const truncatedText = extractedText.slice(0, 16000);

    // Generate summary using OpenAI
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
            content: 'You are a helpful assistant that creates concise summaries. Limit your response to 300 words.'
          },
          {
            role: 'user',
            content: `Please provide a concise summary of the following text:\n\n${truncatedText}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    console.log('Summary generated successfully');

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
    console.error('Error in process-document function:', error);
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