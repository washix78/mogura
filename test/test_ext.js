const childProcess = require('child_process');
const fs = require('fs');

try {
  const marker = 'test';
  const outputPath = `./logs/ext-${marker}.txt`;
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  childProcess.execSync('node ext ./test/ext test');
  const a = fs.readFileSync('./test/ext.txt', 'utf8');
  const b = fs.readFileSync(outputPath, 'utf8');
  if (a === b) {
    console.log('Test succeeded.');
  } else {
    throw new Error('Test failed.');
  }
} catch (e) {
  console.error(e.stack);
}

try {
  const marker = 'test_n';
  const outputPath = `./logs/ext-${marker}.txt`;
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  childProcess.execSync('node ext ./test/ext -n test_n');
  const a = fs.readFileSync('./test/ext_n.txt', 'utf8');
  const b = fs.readFileSync(outputPath, 'utf8');
  if (a === b) {
    console.log('Test succeeded.');
  } else {
    throw new Error('Test failed.');
  }
} catch (e) {
  console.error(e.stack);
}
