import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_CHARS_PER_FILE = 10000; // Limit each file to 10k characters
const MAX_TOTAL_CHARS = 50000; // Limit total content to 50k characters

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('Checking for OpenAI API key:', openAIApiKey ? 'Found' : 'Not found');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }

    const { context, files, model } = await req.json();
    console.log('Received request with model:', model);
    console.log('Context length:', context?.length || 0);
    console.log('Number of files:', files?.length || 0);

    console.log('Preparing file contents with size limits...');
    let totalChars = context?.length || 0;
    const truncatedFileContents = await Promise.all(
      files.map(async (file: { name: string; url: string }) => {
        try {
          const response = await fetch(file.url);
          if (!response.ok) {
            console.warn(`Error reading file ${file.name}, skipping`);
            return '';
          }
          let text = await response.text();
          
          // Truncate individual file if too large
          if (text.length > MAX_CHARS_PER_FILE) {
            console.log(`Truncating ${file.name} from ${text.length} to ${MAX_CHARS_PER_FILE} characters`);
            text = text.slice(0, MAX_CHARS_PER_FILE) + '\n... (content truncated)';
          }
          
          totalChars += text.length;
          return `${file.name}:\n${text}`;
        } catch (error) {
          console.warn(`Error processing file ${file.name}:`, error);
          return '';
        }
      })
    );

    // If total content is still too large, truncate files further
    if (totalChars > MAX_TOTAL_CHARS) {
      console.log(`Total content (${totalChars} chars) exceeds limit. Truncating...`);
      let currentTotal = context?.length || 0;
      const finalFileContents = truncatedFileContents.filter(content => {
        if (currentTotal + content.length <= MAX_TOTAL_CHARS) {
          currentTotal += content.length;
          return true;
        }
        return false;
      });
      console.log(`Reduced to ${finalFileContents.length} files`);
      
      const prompt = `
        Based on the following project information (note: some content was truncated due to size limits):
        
        CONTEXT:
        ${context || 'No context provided'}
        
        FILES:
        ${finalFileContents.join('\n\n')}
        
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
          model: model === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini',
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
    }
  } catch (error) {
    console.error('Error in analyze-project function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});