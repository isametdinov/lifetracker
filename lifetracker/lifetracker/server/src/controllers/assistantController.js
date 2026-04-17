/*
  Assistant controller integrates with the Trinity AI API.
  - Validates prompt input
  - Builds request payload for Trinity
  - Returns AI assistant responses to the frontend
*/
const TRINITY_API_URL = process.env.TRINITY_API_URL || 'https://api.trinity.ai/v1/chat/completions';

// ====COMENT====
// Create and return Trinity API configuration only when a valid API key is configured.
// If the key is missing or still the placeholder, we return null and avoid calling Trinity.
const createTrinityClient = () => {
  const apiKey = process.env.TRINITY_API_KEY;
  if (!apiKey || apiKey.startsWith('your_')) {
    return null;
  }

  return {
    apiKey,
    url: TRINITY_API_URL,
    model: process.env.TRINITY_MODEL || 'trinity-v1',
  };
};

// ====COMENT====
// Main assistant chat endpoint: receives the prompt from the frontend,
// builds the Trinity message payload, calls the Trinity API, and returns the AI answer.
const chatCompletion = async (req, res, next) => {
  try {
    const { prompt, history = [] } = req.body;
    const trinity = createTrinityClient();

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: 'Prompt is required.' });
    }

    if (!trinity) {
      return res.json({
        message:
          'Trinity API key is not configured. Please set TRINITY_API_KEY in the server .env file to enable AI chat.',
      });
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are LifeTracker AI, an assistant that provides friendly productivity and focus advice, task planning suggestions, and motivational coaching.',
      },
      ...history,
      {
        role: 'user',
        content: prompt,
      },
    ];

    let completion;
    try {
      const completionResponse = await fetch(trinity.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${trinity.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: trinity.model,
          messages,
          temperature: 0.8,
          max_tokens: 350,
        }),
      });

      completion = await completionResponse.json();
    } catch (fetchError) {
      return res.status(502).json({
        message:
          'Unable to reach Trinity API. Check TRINITY_API_URL, TRINITY_API_KEY, and network access from the server container.',
        detail: fetchError.message,
      });
    }

    const responseMessage =
      completion?.choices?.[0]?.message?.content?.trim() ||
      completion?.output?.[0]?.content?.[0]?.text?.trim();

    res.json({ message: responseMessage || 'The assistant did not return a response.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { chatCompletion };
