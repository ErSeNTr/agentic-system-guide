# Multi-Agent Sistem Kurulum Rehberi
## Node.js + Claude API ile Adım Adım

> Başlangıç seviyesine uygun, sade ve adım adım rehber.

## 1) Nedir bu sistem?

Bu sistem, tek bir büyük ajanın her işi yapması yerine, görevleri bölen küçük uzman ajanlardan oluşur:

- Router Agent: soruyu anlar ve hangi ajana yönlendirir
- Design Agent: çözüm planı hazırlar
- Code Agent: kod üretir
- Review Agent: kalite ve güvenlik kontrolü yapar

Yani her ajan tek görev üzerine odaklanır.

## 2) Gerekli araçlar

- Node.js 18+
- npm
- Claude API key

## 3) Kurulum

```bash
mkdir agentic-system
cd agentic-system
npm init -y
npm install @anthropic-ai/sdk dotenv
```

`.env` dosyası oluştur:

```env
ANTHROPIC_API_KEY=your_key_here
```

`.gitignore`:

```gitignore
.env
node_modules/
```

## 4) Proje yapısı

```text
agentic-system/
├── .env
├── .gitignore
├── package.json
├── README.md
├── .env.example
├── agents/
│   ├── router.js
│   ├── design.js
│   ├── code.js
│   └── review.js
├── utils/
│   ├── models.js
│   └── tokens.js
├── examples/
│   └── quick-start.js
├── pipeline.js
├── run-pipeline.js
└── package-lock.json
```

## 5) Router ajanı

`utils/models.js`

```javascript
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

  return {
    answer: text,
    tokensUsed,
    model,
  };
}

module.exports = { askClaude, MODELS };
```

`agents/router.js`

```javascript
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
```

## 6) Design agent

`agents/design.js`

```javascript
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
```

## 7) Code agent

`agents/code.js`

```javascript
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
```

## 8) Review agent

`agents/review.js`

```javascript
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
```

## 9) Pipeline

`pipeline.js`

```javascript
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
```

`run-pipeline.js`

```javascript
const { pipeline } = require('./pipeline');

async function main() {
  const question = 'Node.js ile Express API için kullanıcı kayıt endpointi yaz.';
  const result = await pipeline(question);
  console.log(JSON.stringify(result, null, 2));
}

main();
```

## 10) Token takibi

`utils/tokens.js`

```javascript
class TokenTracker {
  constructor() {
    this.sessionTotal = 0;
    this.agents = {};
  }

  add(agentName, value) {
    this.sessionTotal += value;
    if (!this.agents[agentName]) this.agents[agentName] = 0;
    this.agents[agentName] += value;
  }

  summary() {
    console.log('Toplam token kullanımı:', this.sessionTotal);
    console.log('Ajan bazlı kullanım:');
    console.log(this.agents);
  }
}

module.exports = { TokenTracker };
```

## 11) Hızlı örnek

`examples/quick-start.js`

```javascript
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
```

## 12) Çalıştırma

```bash
node examples/quick-start.js
node run-pipeline.js
```

## 13) Ne öğreniyorsun?

Bu rehberle şunları öğreniyorsun:

- Claude API ile doğrudan iletişim
- Router / Designer / Code / Review gibi ajan mantığı
- Token kullanımı kontrolü
- En ucuz ve etkili model seçim stratejileri
- Basit multi-agent sistemi kurma

## 14) Sonraki adım önerileri

- repo tarayıcı ajan ekle
- test ajanı ekle
- debug ajanı ekle
- LangGraph/AutoGen gibi framework'lere geç
- Express veya FastAPI ile web arayüzü yap

---

Bu rehber başlangıç seviyesindedir. İstersen bir sonraki adımda bunu daha profesyonel hale getirebiliriz:

- daha güçlü orchestrator
- GitHub repo içi araştırma ajanı
- test ajanı
- LangGraph tabanlı sürüm
- gerçek üretim sistemi mimarisi

İstersen bunu hemen "v2" olarak çıkarayım.
