const { askClaude } = require('../utils/models');

async function designAgent(requirement) {
  const prompt = `
  Sen bir yazılım mimarisin.
  Gerekli çözüm yaklaşımını kısa ve net anlat.

  Gereksinim:
  ${requirement}

  Şunları içermelidir:
  1. Yaklaşım
  2. Adımlar
  3. Riskler
  4. Beklenen fayda
  `;

  const result = await askClaude(prompt, 'medium', 400);

  return {
    plan: result.answer,
    tokensUsed: result.tokensUsed,
  };
}

module.exports = { designAgent };
