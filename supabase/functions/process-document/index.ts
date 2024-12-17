import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Document } from 'https://deno.land/x/pdfjs@v0.1.0/mod.ts';
import { TextDecoder } from "https://deno.land/std@0.177.0/encoding/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      throw new Error('No file provided');
    }

    // Extract text from file
    const arrayBuffer = await file.arrayBuffer();
    let extractedText = '';

    if (file.type === 'application/pdf') {
      const uint8Array = new Uint8Array(arrayBuffer);
      const doc = await Document.load(uint8Array);
      const pages = await doc.getPages();
      
      for (const page of pages) {
        const textContent = await page.getTextContent();
        extractedText += textContent.items
          .map((item: any) => item.str)
          .join(' ') + '\n';
      }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX files, we'll use the raw text content
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(arrayBuffer);
    } else {
      throw new Error('Unsupported file type');
    }

    if (!extractedText.trim()) {
      throw new Error('No text could be extracted from the file');
    }

    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

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
            content: 'You are a helpful assistant that creates concise summaries. Limit your response to 200 words.'
          },
          {
            role: 'user',
            content: `Please provide a concise summary of the following text:\n\n${extractedText.slice(0, 16000)}`
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

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-document function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});