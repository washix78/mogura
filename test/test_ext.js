const childProcess = require('child_process');
const fs = require('fs');

const testResourceBase = './test/resources/ext';

const testExtension = () => {
  const marker = '__TEST_EXTENSION';
  const outputPath = `./logs/ext-${marker}.txt`;
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  childProcess.execSync(`node ext ${testResourceBase}/extension -m ${marker}`);
  const a = fs.readFileSync(`${testResourceBase}/expect_extension.txt`, 'utf8');
  const b = fs.readFileSync(outputPath, 'utf8');

  if (a !== b) {
    throw new Error('testExtension: a !== b');
  }
};

const testName = () => {
  const marker = '__TEST_NAME';
  const outputPath = `./logs/ext-${marker}.txt`;
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  childProcess.execSync(`node ext ${testResourceBase}/name -m ${marker} -n`);
  const a = fs.readFileSync(`${testResourceBase}/expect_name.txt`, 'utf8');
  const b = fs.readFileSync(outputPath, 'utf8');

  if (a !== b) {
    throw new Error('testName: a !== b');
  }
};

try {
  testExtension();
  testName();

  console.log('Succeeded.')
} catch (e) {
  console.error('Failed.')
  console.error(e.stack);
}
