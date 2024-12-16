import { supabase } from "@/lib/supabase";

interface ProjectFile {
  name: string;
  url: string;
}

export async function analyzeProject(context: string, files: ProjectFile[], model: string = 'gpt-4o-mini') {
  try {
    const { data, error: secretError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'OPENAI_API_KEY')
      .maybeSingle();

    if (secretError) {
      throw new Error('Error al obtener la clave API');
    }
    
    if (!data?.value) {
      throw new Error('API key no encontrada. Por favor, configure primero su clave API de OpenAI.');
    }

    // Preparar el contenido de los archivos
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`Error al leer el archivo ${file.name}`);
        }
        const text = await response.text();
        return `${file.name}:\n${text}`;
      })
    );

    const prompt = `
      Basándote en la siguiente información de proyecto:
      
      CONTEXTO:
      ${context}
      
      ARCHIVOS:
      ${fileContents.join('\n\n')}
      
      Por favor, genera:
      1. Un plan detallado del proyecto
      2. Lista de tareas principales a realizar
      3. Perfiles de especialistas necesarios para el proyecto
      
      Estructura tu respuesta en secciones claras.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.value}`,
      },
      body: JSON.stringify({
        model: model,
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
      throw new Error('Error en la llamada a OpenAI API');
    }

    const responseData = await response.json();
    return responseData.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}