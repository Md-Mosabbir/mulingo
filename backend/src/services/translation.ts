type TranslateArgs = {
  text: string;
  from: string; // language_code
  to: string; // language_code
};

type GroqChoice = {
  message?: {
    content?: string;
  };
};

type GroqResponse = {
  choices?: GroqChoice[];
};

const DEFAULT_GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'llama-3.1-8b-instant';

export async function translateText({ text, from, to }: TranslateArgs): Promise<string> {
  if (!text) return text;
  if (from === to) return text;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const url = process.env.GROQ_API_URL || DEFAULT_GROQ_URL;
  const model = process.env.GROQ_TRANSLATION_MODEL || DEFAULT_GROQ_MODEL;

  // Strict output format keeps parsing deterministic.
  const systemPrompt =
    'You are a translation engine. Return ONLY the translated text with no quotes, labels, markdown, or explanations.';

  const userPrompt = [
    `Translate the following text from "${from}" to "${to}".`,
    'Preserve meaning, names, punctuation, and tone.',
    'If input is ambiguous, choose the most likely direct translation.',
    '',
    'TEXT:',
    text,
  ].join('\n');

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`Groq translation failed (${resp.status}): ${body || resp.statusText}`);
  }

  const json = (await resp.json()) as GroqResponse;
  const translated = json.choices?.[0]?.message?.content?.trim();
  if (!translated) throw new Error('Groq translation response was empty');

  return translated;
}

