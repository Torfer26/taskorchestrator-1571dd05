import { supabase } from "@/lib/supabase";

export async function analyzeProject(context: string, files: { name: string; url: string }[]) {
  try {
    const { data, error: secretError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'OPENAI_API_KEY')
      .single();

    if (secretError) throw new Error('No se pudo obtener la clave de API');
    if (!data?.value) throw new Error('API key no encontrada');

    // Preparar el contenido de los archivos
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const response = await fetch(file.url);
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
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Error al comunicarse con OpenAI');
    }

    const responseData = await response.json();
    return responseData.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}