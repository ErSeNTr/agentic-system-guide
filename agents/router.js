const { askClaude } = require('../utils/models');

async function routerAgent(userQuestion) {
  const routerPrompt = `
  Sen bir görev yönlendiricisisin.
  Kullanıcının sorusunu oku ve JSON formatında cevap ver.

  Soru: "${userQuestion}"

  Cevap formatı:
  {
    "type": "code_generation|bug_fix|repo_analysis|simple_question|pr_review",
    "difficulty": "easy|medium|hard",
    "requiredAgents": ["design","code","review"],
    "estimatedTokens": "low|medium|high"
  }
  `;

  const result = await askClaude(routerPrompt, 'cheap', 300);
  const decision = JSON.parse(result.answer);

  return {
    decision,
    totalTokensUsed: result.tokensUsed,
  };
}

module.exports = { routerAgent };
