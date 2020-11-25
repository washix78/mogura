const childProcess = require('child_process');
const fs = require('fs');
const readline = require('readline');

const getLineFromFile = (fpath) => {
  return new Promise((resolve, reject) => {
    const lines = [];
    readline.createInterface({
      input: fs.createReadStream(fpath),
    }).
    on('error', (err) => { reject(err); }).
    on('close', () => { resolve(lines); }).
    on('line', (line) => { lines.push(line); });
  });
};

const testResourceBase = './test/resources/info';

const testDirectory = async () => {
  const marker = '__TEST_DIRECTORY';

  const outputPath = `./logs/info-${marker}.txt`;
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  childProcess.execSync(`node info -d ${testResourceBase}/directory -m ${marker}`);

  const alines = await getLineFromFile(`${testResourceBase}/expect_directory.txt`);
  const blines = await getLineFromFile(outputPath);
  if (alines.length !== blines.length) {
    throw new Error('testDirectory');
  }
  for (let i = 0; i < alines.length; i++) {
    const a = alines[i];
    const b = blines[i];
    const aelms = a.split('\t');
    const belms = b.split('\t');
    // [ # fpath size md5 sha1 birthtime mtime]
    if (belms.length !== 7) {
      throw new Error('testDirectory: belms.length !== 7');
    }
    if (aelms[0] !== belms[0]) {
      throw new Error('testDirectory: #');
    }
    if (`${process.cwd()}/${aelms[1]}` !== belms[1]) {
      throw new Error('testDirectory: fpath');
    }
    if (aelms[2] !== belms[2]) {
      throw new Error('testDirectory: size');
    }
    if (aelms[3] !== belms[3]) {
      throw new Error('testDirectory: md5');
    }
    if (aelms[4] !== belms[4]) {
      throw new Error('testDirectory: sha1');
    }
    if (!/^[0-9]{17}$/.test(belms[5])) {
      throw new Error('testDirectory: birthtime');
    }
    if (!/^[0-9]{17}$/.test(belms[6])) {
      throw new Error('testDirectory: mtime');
    }
    if (!(belms[5] <= belms[6])) {
      throw new Error('testDirectory: birthtime <= mtime');
    }
  }
};

const testFile = async () => {
  const marker = '__TEST_FILE';

  const outputPath = `./logs/info-${marker}.txt`;
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  childProcess.execSync(`node info -f ${testResourceBase}/src_test_file.txt -m ${marker}`);

  const alines = await getLineFromFile(`${testResourceBase}/expect_file.txt`);
  const blines = await getLineFromFile(outputPath);
  if (alines.length !== blines.length) {
    throw new Error('testFile');
  }

  for (let i = 0; i < alines.length; i++) {
    const a = alines[i];
    const b = blines[i];
    const aelms = a.split('\t');
    const belms = b.split('\t');
    // [ # fpath size md5 sha1 birthtime mtime]
    if (aelms[0] === '#ERR') {
      if (belms.length !== 2) {
        throw new Error('testFile: belms.length !== 2');
      }
    } else {
      if (belms.length !== 7) {
        throw new Error('testFile: belms.length !== 7');
      }
    }

    if (aelms[0] !== belms[0]) {
      throw new Error('testFile: #');
    }
    if (aelms[1] !== belms[1]) {
      throw new Error('testFile: fpath');
    }

    if (aelms[0] === '#ERR') {
      continue;
    }

    if (aelms[2] !== belms[2]) {
      throw new Error('testFile: size');
    }
    if (aelms[3] !== belms[3]) {
      throw new Error('testFile: md5');
    }
    if (aelms[4] !== belms[4]) {
      throw new Error('testFile: sha1');
    }
    if (!/^[0-9]{17}$/.test(belms[5])) {
      throw new Error('testFile: birthtime');
    }
    if (!/^[0-9]{17}$/.test(belms[6])) {
      throw new Error('testFile: mtime');
    }
    if (!(belms[5] <= belms[6])) {
      throw new Error('testFile: birthtime <= mtime');
    }
  }
};

const test = async () => {
  try {
    await testDirectory();
    await testFile();

    console.log('Succeeded.');
  } catch (e) {

    console.error('Failed.')
    console.error(e.stack);
  }
};
test();
