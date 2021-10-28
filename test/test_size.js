const childProcess = require('child_process');
const fs = require('fs-extra');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const expectRecordList = [
  '1_1/0_12345678901234567-1_1.bmp:dir2/dir1/1_1.bmp',
  '1_1/1_12345678901234567-1_1.gif:dir2/1_1.gif',
  '10_1/0_12345678901234567-1_10.jpg:dir1/1_10.jpg',
  '10_1/1_12345678901234567-10_1.png:10_1.png',
  '10_2/0_12345678901234567-2_10.bmp:dir2/dir2/2_10.bmp',
  '10_2/1_12345678901234567-10_2.gif:dir2/dir1/10_2.gif',
  '10_10/0_12345678901234567-10_10.jpg:dir2/10_10.jpg',
  '10_10/1_12345678901234567-10_10.png:dir1/10_10.png',
  'other.d/0_12345678901234567-file0:99_76543210987654321-file0',
  'other.d/1_12345678901234567-file1:dir1/file1',
  'other.d/2_12345678901234567-file2:dir2/98_76543210987654321-file2',
  'other.d/3_12345678901234567-file3:dir2/dir1/file3',
  'other.d/4_12345678901234567-file4:dir2/dir2/97_76543210987654321-file4',
  'other.d/5_12345678901234567-file5:file5',
  'other.d/6_12345678901234567-file6:dir1/96_76543210987654321-file6',
  'other.d/7_12345678901234567-file7:dir2/file7',
  'other.d/8_12345678901234567-file8:dir2/dir1/95_76543210987654321-file8',
  'other.d/9_12345678901234567-file9:dir2/dir2/file9'
];
const recordRegExp = /^(?<size>other\.d|\d+_\d+)\/(?<no>\d+)_\d{17}\-(?<newName>.+)\:(?<oldPath>.+)$/;
const expectBeforeTargetFpathList = [
  `${process.cwd()}/testwork/size/dir2/dir1/1_1.bmp`,
  `${process.cwd()}/testwork/size/dir2/1_1.gif`,
  `${process.cwd()}/testwork/size/dir1/1_10.jpg`,
  `${process.cwd()}/testwork/size/10_1.png`,
  `${process.cwd()}/testwork/size/dir2/dir2/2_10.bmp`,
  `${process.cwd()}/testwork/size/dir2/dir1/10_2.gif`,
  `${process.cwd()}/testwork/size/dir2/10_10.jpg`,
  `${process.cwd()}/testwork/size/dir1/10_10.png`,
  `${process.cwd()}/testwork/size/99_76543210987654321-file0`,
  `${process.cwd()}/testwork/size/dir1/file1`,
  `${process.cwd()}/testwork/size/dir2/98_76543210987654321-file2`,
  `${process.cwd()}/testwork/size/dir2/dir1/file3`,
  `${process.cwd()}/testwork/size/dir2/dir2/97_76543210987654321-file4`,
  `${process.cwd()}/testwork/size/file5`,
  `${process.cwd()}/testwork/size/dir1/96_76543210987654321-file6`,
  `${process.cwd()}/testwork/size/dir2/file7`,
  `${process.cwd()}/testwork/size/dir2/dir1/95_76543210987654321-file8`,
  `${process.cwd()}/testwork/size/dir2/dir2/file9`
].sort();
const expectBeforeTargetSLpathList = [
  `${process.cwd()}/testwork/size/dir2/dir2/syml0`
].sort();
const expectExtraPathList = [
  'extra.d',
  'extra.d/dir1',
  'extra.d/dir2',
  'extra.d/dir2/dir1',
  'extra.d/dir2/dir2',
  'extra.d/dir2/dir2/syml0'
].sort();

// test log
// test target directory
// test extra directory
const test_not_forced = async () => {
  childProcess.execSync(`node size ./testwork/size -s TEST_NOT_FORCED`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'size_TEST_NOT_FORCED.json'));
  if (info['Target directory'] !== `${process.cwd()}/testwork/size`) {
    throw new Error(`Target directory: ${info['Target directory']}`);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSLpathList.length) {
    throw new Error(``);
  }
  if (info['Forced'] !== false) {
    throw new Error(`Forced: ${info['Forced']}`);
  }
  if (info['Extra directory'] !== null) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(`${expectRecordList.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    const record = info['Records'][i];
    if (!recordRegExp.test(record)) {
      throw new Error(``);
    }
  }
  const actualRecord_size_no = info['Records'].map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.size}:${groups.no}`;
  }).sort();
  const expectRecord_size_no = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.size}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_size_no.length; i++) {
    const actual = actualRecord_size_no[i];
    const expect = expectRecord_size_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualRecord_size_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.size}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_size_newName_oldPath = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.size}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  for (let i = 0; i < actualRecord_size_newName_oldPath.length; i++) {
    const actual = actualRecord_size_newName_oldPath[i];
    const expect = expectRecord_size_newName_oldPath[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/size').sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(``);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/size').sort();
  if (targetSlpaths.length !== expectBeforeTargetSLpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSLpathList[i]) {
      throw new Error(``);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'size_TEST_NOT_FORCED');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
};

// test log
// test target directory
// test extra directory
const test_forced = async () => {
  childProcess.execSync(`node size ./testwork/size -s TEST_FORCED -F`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'size_TEST_FORCED.json'));
  if (info['Target directory'] !== `${process.cwd()}/testwork/size`) {
    throw new Error(`Target directory: ${info['Target directory']}`);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSLpathList.length) {
    throw new Error(``);
  }
  if (info['Forced'] !== true) {
    throw new Error(`Forced: ${info['Forced']}`);
  }
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'size_TEST_FORCED');
  if (info['Extra directory'] !== execIdDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(`${expectRecordList.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    const record = info['Records'][i];
    if (!recordRegExp.test(record)) {
      throw new Error(``);
    }
  }
  const actualRecord_size_no = info['Records'].map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.size}:${groups.no}`;
  }).sort();
  const expectRecord_size_no = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.size}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_size_no.length; i++) {
    const actual = actualRecord_size_no[i];
    const expect = expectRecord_size_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualRecord_size_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.size}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_size_newName_oldPath = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.size}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  for (let i = 0; i < actualRecord_size_newName_oldPath.length; i++) {
    const actual = actualRecord_size_newName_oldPath[i];
    const expect = expectRecord_size_newName_oldPath[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }

  // test target directory
  const targetPaths = utility.getFilePaths('./testwork/size').concat(
    utility.getSymbolicLinkPaths('./testwork/size')
  );
  if (targetPaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  const targetPathRegExp = /^(?:.+)\/(?<size>other\.d|\d+_\d+)\/(?<no>\d+)_\d{17}\-(?<name>.+)$/;
  for (let i = 0; i < targetPaths.length; i++) {
    const testPath = targetPaths[i];
    if (!targetPathRegExp.test(testPath)) {
      throw new Error(``);
    }
  }
  const actualTargetPath_size_name = targetPaths.map(testPath => {
    const groups = targetPathRegExp.exec(testPath).groups;
    return `${groups.size}:${groups.name}`;
  }).sort();
  const expectTargetPath_size_name = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.size}:${groups.newName}`;
  }).sort();
  for (let i = 0; i < actualTargetPath_size_name.length; i++) {
    const actual = actualTargetPath_size_name[i];
    const expect = expectTargetPath_size_name[i];
    if (actual !== expect) {
      console.log(actual);
      console.log(expect);
      throw new Error(``);
    }
  }
  // test extra directory
  const extraPaths = utility.getAllPaths(execIdDpath);
  if (extraPaths.length !== expectExtraPathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < extraPaths.length; i++) {
    const testPath = extraPaths[i];
    if (fs.lstatSync(testPath).isFile()) {
      throw new Error(``);
    }
  }
  const omittedExtraPaths = extraPaths.map(testPath => utility.omitPath(testPath, execIdDpath)).sort();
  for (let i = 0; i < omittedExtraPaths.length; i++) {
    if (omittedExtraPaths[i] !== expectExtraPathList[i]) {
      throw new Error(``);
    }
  }
};

const main = async () => {
  fs.emptyDirSync('./testwork/size');
  fs.copySync('./test/resources/size', './testwork/size');

  await test_not_forced();
  await test_forced();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
