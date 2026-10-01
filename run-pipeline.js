const { pipeline } = require('./pipeline');

async function main() {
  const question = 'Node.js ile Express API için kullanıcı kayıt endpointi yaz.';
  const result = await pipeline(question);
  console.log(JSON.stringify(result, null, 2));
}

main();
