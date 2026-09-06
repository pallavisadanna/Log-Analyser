const MODEL = process.env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
const ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';

function send(res, status, body) {
  res.status(status).json(body);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Only POST is supported.' });
  if (!process.env.HF_TOKEN) return send(res, 500, { error: 'The AI endpoint is not configured. Add HF_TOKEN in Vercel environment variables.' });

  const incident = req.body?.incident;
  if (!incident || typeof incident !== 'object') return send(res, 400, { error: 'A structured incident summary is required.' });

  // This endpoint accepts aggregates and normalized signatures only, never uploaded raw log files.
  const compact = JSON.stringify(incident);
  if (compact.length > 18000) return send(res, 413, { error: 'Incident summary is too large.' });

  const prompt = `You are an experienced site reliability engineer. Analyze this redacted, aggregated production incident data. Do not invent facts or claim certainty. Return concise Markdown with these headings: Severity, Likely cause, Evidence, Immediate actions, and What to check next.\n\nIncident data:\n${compact}`;

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 550, stream: false })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Hugging Face inference error:', data);
      return send(res, 502, { error: 'The hosted model could not analyze this incident. Check your Hugging Face token and selected model.' });
    }
    const analysis = data.choices?.[0]?.message?.content;
    if (!analysis) return send(res, 502, { error: 'The hosted model returned an unexpected response.' });
    return send(res, 200, { analysis, model: MODEL });
  } catch (error) {
    console.error('AI endpoint error:', error);
    return send(res, 502, { error: 'Unable to reach the hosted AI provider.' });
  }
};
