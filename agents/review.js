const { askClaude } = require('../utils/models');

async function reviewAgent(code, requirement) {
  const prompt = `
  Sen bir kod inceleyicisisin.

  Gereksinim:
  ${requirement}

  Kod:
  ${code}

  Şu konuları kontrol et:
  - güvenlik
  - hata potansiyeli
  - performans
  - gereksinim uyumu

  Kısa ve net yanıt ver.
  `;

  const result = await askClaude(prompt, 'medium', 600);

  return {
    review: result.answer,
    tokensUsed: result.tokensUsed,
    hasProblem: !result.answer.toLowerCase().includes('sorun yok'),
  };
}

module.exports = { reviewAgent };
