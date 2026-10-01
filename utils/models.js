const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODELS = {
  cheap: 'claude-3-5-haiku-20241022',
  medium: 'claude-3-5-sonnet-20241022',
  strong: 'claude-3-5-sonnet-20241022',
};

async function askClaude(prompt, modelType = 'cheap', maxTokens = 500) {
  const model = MODELS[modelType] || MODELS.cheap;

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content?.[0]?.text || '';
  const tokensUsed =
    (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

  return { answer: text, tokensUsed, model };
}

module.exports = { askClaude, MODELS };
