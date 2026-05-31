const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function classifyOccurrence(base64Image) {
  const prompt = `Você é um sistema de classificação de problemas urbanos.
Analise a imagem e retorne APENAS um JSON válido, sem texto adicional, no seguinte formato:
{
  "categoria": "uma dessas opções: Buraco na via, Iluminação pública, Descarte irregular de lixo, Alagamento, Árvore em risco, Calçada danificada, Outro",
  "gravidade": "uma dessas opções: Baixa, Média, Alta",
  "descricao": "descrição curta do problema em até 20 palavras"
}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Image,
            },
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('Erro Gemini:', error);
    return {
      categoria: 'Outro',
      gravidade: 'Média',
      descricao: 'Não foi possível classificar automaticamente',
    };
  }
}