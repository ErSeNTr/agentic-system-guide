const { routerAgent } = require('./agents/router');
const { designAgent } = require('./agents/design');
const { codeAgent } = require('./agents/code');
const { reviewAgent } = require('./agents/review');

async function pipeline(userQuestion) {
  const routerResult = await routerAgent(userQuestion);

  if (routerResult.decision.type === 'simple_question') {
    return {
      type: 'simple',
      result: 'Basit soru olarak işleme alındı.',
      tokens: routerResult.totalTokensUsed,
    };
  }

  const designResult = await designAgent(userQuestion);
  const codeResult = await codeAgent(userQuestion, designResult.plan);
  const reviewResult = await reviewAgent(codeResult.code, userQuestion);

  return {
    type: 'full',
    router: routerResult,
    design: designResult,
    code: codeResult,
    review: reviewResult,
    totalTokens:
      routerResult.totalTokensUsed +
      designResult.tokensUsed +
      codeResult.tokensUsed +
      reviewResult.tokensUsed,
  };
}

module.exports = { pipeline };
