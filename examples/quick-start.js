require('dotenv').config();
const { askClaude } = require('../utils/models');

async function quickDemo() {
  const result = await askClaude(
    'Bu görev code_generation mı, bug_fix mi, repo_analysis mı?',
    'cheap',
    200
  );

  console.log(result.answer);
}

quickDemo();
