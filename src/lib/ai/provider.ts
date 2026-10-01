export interface CompletionOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export async function generateCompletion(options: CompletionOptions): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  // 1. Check Groq (Ultra-Fast 300+ tps Llama-3.3-70b)
  if (groqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            { role: 'user', content: options.prompt }
          ],
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 3500,
          response_format: options.jsonMode ? { type: 'json_object' } : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (err) {
      console.warn('Groq API call failed, trying next provider:', err);
    }
  }

  // 2. Check Google Gemini
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${options.systemPrompt ? options.systemPrompt + '\n\n' : ''}${options.prompt}` }]
              }
            ],
            generationConfig: {
              temperature: options.temperature ?? 0.3,
              maxOutputTokens: options.maxTokens ?? 3500,
              responseMimeType: options.jsonMode ? 'application/json' : 'text/plain'
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn('Gemini API call failed, trying next provider:', err);
    }
  }

  // 2. Check OpenAI
  if (openAiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            { role: 'user', content: options.prompt }
          ],
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 3000,
          response_format: options.jsonMode ? { type: 'json_object' } : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to deterministic engine:', err);
    }
  }

  // 3. Fallback: Signal to use the domain-specific rule-based planner
  return '__USE_LOCAL_ENGINE__';
}
