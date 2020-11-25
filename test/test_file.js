const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const testResourceBase = './test/resources/file';

const getLineFromFile = (fpath) => {
  return new Promise((resolve, reject) => {
    let lines = [];
    readline.createInterface({
      input: fs.createReadStream(fpath),
    }).
      on('error', (err) => reject(err)).
      on('close', () => resolve(lines)).
      on('line', line => lines.push(line));
  });
};

const testBasic = async () => {
  const marker = '__TEST_BASIC';
  const outputPath = `./logs/file-${marker}.txt`;
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  childProcess.execSync(`node file ${testResourceBase}/basic -m ${marker}`);

  const alines = (await getLineFromFile(`${testResourceBase}/expect_basic.txt`)).
    map(line => path.resolve(testResourceBase, line));
  const blines = await getLineFromFile(outputPath);
  if (alines.length === 0 || blines.length === 0 || alines.length !== blines.length) {
    throw new Error('testBasic');
  }

  alines.forEach((aline, i) => {
    if (aline !== blines[i]) {
      throw new Error('testBasic: aline !== blines[i');
    }
  });
};

const testExtension = async () => {
  const marker = "__TEST_EXTENSION";
  const outputPath = `./logs/file-${marker}.txt`;
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  childProcess.execSync(`node file ${testResourceBase}/extension -m ${marker} -e "" a c`);

  const alines = (await getLineFromFile(`${testResourceBase}/expect_extension.txt`)).
    map(line => path.resolve(testResourceBase, line));
  const blines = await getLineFromFile(outputPath);
  if (alines.length === 0 || blines.length === 0 || alines.length !== blines.length) {
    throw new Error('testExtension');
  }
  alines.forEach((aline, i) => {
    if (aline !== blines[i]) {
      throw new Error('testExtension: aline !== blines[i]');
    }
  });
};

const testName = async () => {
  const marker = '__TEST_NAME';
  const outputPath = `./logs/file-${marker}.txt`
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  childProcess.execSync(`node file ${testResourceBase}/name -m ${marker} -n "NAME" "f1.a"`);

  const alines = (await getLineFromFile(`${testResourceBase}/expect_name.txt`)).
    map(line => path.resolve(testResourceBase, line));
  const blines = await getLineFromFile(outputPath);

  if (alines.length === 0 || alines.length !== blines.length) {
    throw new Error('testName');
  }
  alines.forEach((aline, i) => {
    if (aline !== blines[i]) {
      throw new Error('testName: aline !== blines[i]');
    }
  });
};

const testExtensionFile = async () => {
  const marker = '__TEST_EXTENSION_FILE';
  const outputPath = `./logs/file-${marker}.txt`;
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  childProcess.execSync(`node file ${testResourceBase}/extension_file -m ${marker} ` +
    `-ef ${testResourceBase}/list_extension.txt`);

  const alines = (await getLineFromFile(`${testResourceBase}/expect_extension_file.txt`)).
    map(line => path.resolve(testResourceBase, line));
  const blines = await getLineFromFile(outputPath);

  if (alines.length === 0 || alines.length !== blines.length) {
    throw new Error('testExtensionFile');
  }
  alines.forEach((aline, i) => {
    if (aline !== blines[i]) {
      throw new Error('testExtensionFile: aline !== blines[i]');
    }
  });
};

const testNameFile = async () => {
  const marker = '__TEST_NAME_FILE';
  const outputPath = `./logs/file-${marker}.txt`;
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  childProcess.execSync(`node file ${testResourceBase}/name_file -m ${marker} ` +
    `-nf ${testResourceBase}/list_name.txt`);

  const alines = (await getLineFromFile(`${testResourceBase}/expect_name_file.txt`)).
    map(line => path.resolve(testResourceBase, line));
  const blines = await getLineFromFile(outputPath);

  if (alines.length === 0 || alines.length !== blines.length) {
    throw new Error('testNameFile');
  }
  alines.forEach((aline, i) => {
    if (aline !== blines[i]) {
      throw new Error('testNameFile: aline !== blines[i]');
    }
  });
};

const testMax = async () => {
  const marker = '__TEST_MAX';
  const outputPath = `./logs/file-${marker}.txt`;
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  childProcess.execSync(`node file ${testResourceBase}/max -m ${marker} ` +
    `-mx 1k`);

  const alines = (await getLineFromFile(`${testResourceBase}/expect_max.txt`)).
    map(line => path.resolve(testResourceBase, line));
  const blines = await getLineFromFile(outputPath);

  if (alines.length === 0 || alines.length !== blines.length) {
    throw new Error('testMax');
  }
  alines.forEach((aline, i) => {
    if (aline !== blines[i]) {
      throw new Error('testMax: aline !== blines[i]');
    }
  });
};

const test = async () => {
  try {
    await testBasic();
    await testExtension();
    await testName();
    await testExtensionFile();
    await testNameFile();
    await testMax();

    console.log('Succeeded.');
  } catch (e) {
    console.error('Failed.');
    console.error(e.stack);
  }
};
test();
