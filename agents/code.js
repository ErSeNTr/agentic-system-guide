const { askClaude } = require('../utils/models');

async function codeAgent(requirement, designPlan) {
  const prompt = `
  Sen bir yazılım geliştiricisin.
  Bu gereksinimi JavaScript/Node.js ile uygula.

  Gereksinim:
  ${requirement}

  Tasarım planı:
  ${designPlan}

  Sadece kod üret. Açıklama ekleme.
  `;

  const result = await askClaude(prompt, 'strong', 1000);

  return {
    code: result.answer,
    tokensUsed: result.tokensUsed,
  };
}

module.exports = { codeAgent };
