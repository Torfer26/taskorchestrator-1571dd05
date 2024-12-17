import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const ASSISTANT_ID = 'asst_eqArAwiEHSlIWfSCmSV9DzMr'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const query = formData.get('query') as string

    if (!file || !query) {
      throw new Error('Missing file or query')
    }

    // 1. Upload file to OpenAI
    const fileFormData = new FormData()
    fileFormData.append('file', file)
    fileFormData.append('purpose', 'assistants')

    const fileUploadResponse = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: fileFormData,
    })

    if (!fileUploadResponse.ok) {
      throw new Error('Failed to upload file to OpenAI')
    }

    const fileData = await fileUploadResponse.json()
    const fileId = fileData.id

    // 2. Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: query,
            file_ids: [fileId],
          },
        ],
      }),
    })

    if (!threadResponse.ok) {
      throw new Error('Failed to create thread')
    }

    const threadData = await threadResponse.json()
    const threadId = threadData.id

    // 3. Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
      }),
    })

    if (!runResponse.ok) {
      throw new Error('Failed to run assistant')
    }

    const runData = await runResponse.json()
    const runId = runData.id

    // 4. Poll for completion
    let runStatus = 'queued'
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      )

      if (!statusResponse.ok) {
        throw new Error('Failed to check run status')
      }

      const statusData = await statusResponse.json()
      runStatus = statusData.status

      if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
        throw new Error(`Run ended with status: ${runStatus}`)
      }
    }

    // 5. Get messages
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    )

    if (!messagesResponse.ok) {
      throw new Error('Failed to retrieve messages')
    }

    const messagesData = await messagesResponse.json()
    const lastMessage = messagesData.data[0]
    const assistantResponse = lastMessage.content[0].text.value

    // 6. Clean up - delete the file
    await fetch(`https://api.openai.com/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    })

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})