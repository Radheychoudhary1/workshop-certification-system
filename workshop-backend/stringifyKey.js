const fs = require('fs');

const key = require('./serviceAccountKey.json');
const stringified = JSON.stringify(key);

fs.writeFileSync('serviceAccountKey.env.txt', stringified);
console.log('✅ Key has been stringified and saved to serviceAccountKey.env.txt');
