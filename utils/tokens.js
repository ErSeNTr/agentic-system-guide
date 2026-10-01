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
