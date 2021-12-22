const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const resourceFpaths = [
  'file1:file1.txt',
  'file2:dir1/file2',
  'file3:dir2/file3.',
  'file4:dir2/dir1/file4',
  'file5:dir2/dir2/file5.txt',
  'file6:file6.HTML',
  'file7:dir1/file7.html',
  'file8:dir2/file.8.TXT'
];
const resourceSlpaths = [
  'file1:dir2/dir1/syml1.txt',
  'file2:dir2/dir2/syml2.',
  'file3:syml3',
  'file4:dir1/syml4.TXT',
  'file5:dir2/syml5.TXT',
  'file6:dir2/dir1/syml6.'
];

const expectLog = {
  'Target directory': path.resolve(process.cwd(), 'testwork/info'),
  'Target file count': 8,
  'Target symbolic link count': 6,
  'File extensions': {
    'HTML': 2,
    'TXT': 3,
    'ext_none.d': 2,
    'ext_zero.d': 1
  },
  'Symbolic link extensions': {
    'TXT': 3,
    'ext_none.d': 1,
    'ext_zero.d': 2
  },
  'Time': -1
};

const test = async () => {
  childProcess.execSync(`node info ./testwork/info -s TEST`);

  const logFpath = utility.getLatestFpath('./logs', timestamp, 'info_TEST.json');
  const log = require(logFpath);

  if (Object.keys(log).length !== Object.keys(expectLog).length) {
    throw new Error(`${Object.keys(log).length}`);
  }
  if (log['Target directory'] !== expectLog['Target directory']) {
    throw new Error(`${log['Target directory']}`);
  }
  if (log['Target file count'] !== expectLog['Target file count']) {
    throw new Error(`${log['Target file count']}`);
  }
  if (log['Symbolic link count'] !== expectLog['Symbolic link count']) {
    throw new Error(`${log['Symbolic link count']}`);
  }
  const fileExtensions = Object.keys(log['File extensions']);
  if (fileExtensions.length !== Object.keys(expectLog['File extensions']).length) {
    throw new Error(`${fileExtensions.length}`);
  }
  for (let i = 0; i < fileExtensions.length; i++) {
    const extension = fileExtensions[i];
    const count = log['File extensions'][extension];
    if (count !== expectLog['File extensions'][extension]) {
      throw new Error(`${extension}: ${log['File extensions'][extension]}`);
    }
  }
  const slExtensions = Object.keys(log['Symbolic link extensions']);
  if (slExtensions.length !== Object.keys(expectLog['Symbolic link extensions']).length) {
    throw new Error(`${slExtensions.length}`);
  }
  for (let i = 0; i < slExtensions.length; i++) {
    const extension = slExtensions[i];
    const count = log['Symbolic link extensions'][extension];
    if (count !== expectLog['Symbolic link extensions'][extension]) {
      throw new Error(`${log['Symbolic link extensions'][extension]}`);
    }
  }
  if (!(-1 < log['Time'])) {
    throw new Error(`${log['Time']}`);
  }
};

const main = async () => {
  const baseDpath = path.resolve(process.cwd(), 'testwork/info');
  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);

  await test();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
