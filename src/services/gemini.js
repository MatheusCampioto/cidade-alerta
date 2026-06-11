const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function classifyOccurrence(base64Image, mimeType = 'image/jpeg') {
  const prompt = `
Você é um sistema de classificação de problemas urbanos.

Analise a imagem e retorne APENAS um JSON válido, sem texto adicional, sem markdown, no seguinte formato:

{
  "categoria": "uma dessas opções: Buraco na via, Iluminação pública, Descarte irregular de lixo, Alagamento, Árvore em risco, Calçada danificada, Outro",
  "gravidade": "uma dessas opções: Baixa, Média, Alta",
  "descricao": "descrição curta do problema em até 20 palavras"
}
`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Chave do Gemini não encontrada no .env');
    }

    console.log('Enviando requisição para o Gemini...');
    console.log('Modelo usado:', GEMINI_MODEL);

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const rawText = await response.text();
    console.log('Resposta bruta recebida do Google:', rawText);

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${rawText}`);
    }

    const data = JSON.parse(rawText);

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('O Gemini não retornou texto.');
    }

    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      categoria: parsed.categoria || 'Outro',
      gravidade: parsed.gravidade || 'Média',
      descricao:
        parsed.descricao || 'Não foi possível classificar automaticamente',
    };
  } catch (error) {
    console.error('Erro detalhado no serviço Gemini:', error);

    return {
      categoria: 'Outro',
      gravidade: 'Média',
      descricao: 'Não foi possível classificar automaticamente',
    };
  }
}