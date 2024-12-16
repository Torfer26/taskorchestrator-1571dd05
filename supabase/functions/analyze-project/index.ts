import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { context, files, model } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }

    console.log('Preparing file contents...');
    const fileContents = await Promise.all(
      files.map(async (file: { name: string; url: string }) => {
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`Error reading file ${file.name}`);
        }
        const text = await response.text();
        return `${file.name}:\n${text}`;
      })
    );

    const prompt = `
      Based on the following project information:
      
      CONTEXT:
      ${context}
      
      FILES:
      ${fileContents.join('\n\n')}
      
      Please generate:
      1. A detailed project plan
      2. List of main tasks to be completed
      3. Required specialist profiles for the project
      
      Structure your response in clear sections.
    `;

    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates content based on user prompts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`Error in OpenAI API call: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify({ analysis: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-project function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});