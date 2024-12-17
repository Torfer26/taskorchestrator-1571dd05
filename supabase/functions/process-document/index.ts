import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse } from 'https://deno.land/x/pdf@v0.1.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileUrl } = await req.json()
    console.log('Processing file:', fileUrl)

    // Download the file
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    const arrayBuffer = await response.arrayBuffer()

    let text = ''
    
    if (contentType?.includes('pdf')) {
      const pdfData = await parse(new Uint8Array(arrayBuffer))
      text = pdfData.text
    } else if (contentType?.includes('docx')) {
      // For DOCX files, we'll need to implement a different parser
      // For now, we'll return an error
      throw new Error('DOCX processing not yet implemented')
    } else {
      throw new Error('Unsupported file type')
    }

    // Generate a simple summary (first 500 characters)
    const summary = text.substring(0, 500) + '...'

    return new Response(
      JSON.stringify({ 
        text, 
        summary 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error processing document:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error processing document' 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})