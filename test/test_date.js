const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const baseDpathY = path.resolve(process.cwd(), 'testwork/date_y');
const baseDpathYm = path.resolve(process.cwd(), 'testwork/date_ym');
const baseDpathYmd = path.resolve(process.cwd(), 'testwork/date_ymd');

const resourceFpaths = [
  'file0:file0',
  'file0:dir2/dir2/99_76543210987654321-file0',
  'file1:dir1/file1',
  'file1:dir2/dir1/file1',
  'file2:dir2/98_76543210987654321-file2',
  'file2:dir2/file2',
  'file3:dir1/file3',
  'file3:dir2/dir1/file3',
  'file4:97_76543210987654321-file4',
  'file4:dir2/dir2/file4'
];
const resourceSlpaths = [
  'file0:dir2/dir2/syml0',
  'file1:dir2/dir1/syml1',
  'file2:dir2/syml2',
  'file3:dir1/syml3',
  'file4:syml4'
];

const expectRecordListDy = [
  '1234/99_12345678901234567-file0:file0',
  '1234/99_12345678901234567-file1:dir1/file1',
  '1234/99_12345678901234567-file2:dir2/file2',
  '1234/99_12345678901234567-file3:dir2/dir1/file3',
  '1234/99_12345678901234567-file4:dir2/dir2/file4',
  '1234/99_12345678901234567-file0:dir2/dir2/99_76543210987654321-file0',
  '1234/99_12345678901234567-file1:dir2/dir1/file1',
  '1234/99_12345678901234567-file2:dir2/98_76543210987654321-file2',
  '1234/99_12345678901234567-file3:dir1/file3',
  '1234/99_12345678901234567-file4:97_76543210987654321-file4'
];
const recordRegExpDy = /^(?<ymd>\d{4})\/(?<no>\d+)_(?<btime>\d{17})\-(?<newName>.+)\:(?<oldPath>.+)$/;
const expectRecordListDym = [
  '1234-56/99_12345678901234567-file0:file0',
  '1234-56/99_12345678901234567-file1:dir1/file1',
  '1234-56/99_12345678901234567-file2:dir2/file2',
  '1234-56/99_12345678901234567-file3:dir2/dir1/file3',
  '1234-56/99_12345678901234567-file4:dir2/dir2/file4',
  '1234-56/99_12345678901234567-file0:dir2/dir2/99_76543210987654321-file0',
  '1234-56/99_12345678901234567-file1:dir2/dir1/file1',
  '1234-56/99_12345678901234567-file2:dir2/98_76543210987654321-file2',
  '1234-56/99_12345678901234567-file3:dir1/file3',
  '1234-56/99_12345678901234567-file4:97_76543210987654321-file4'
];
const recordRegExpDym = /^(?<ymd>\d{4}\-\d{2})\/(?<no>\d+)_(?<btime>\d{17})\-(?<newName>.+)\:(?<oldPath>.+)$/;
const expectRecordListDymd = [
  '1234-56-78/99_12345678901234567-file0:file0',
  '1234-56-78/99_12345678901234567-file1:dir1/file1',
  '1234-56-78/99_12345678901234567-file2:dir2/file2',
  '1234-56-78/99_12345678901234567-file3:dir2/dir1/file3',
  '1234-56-78/99_12345678901234567-file4:dir2/dir2/file4',
  '1234-56-78/99_12345678901234567-file0:dir2/dir2/99_76543210987654321-file0',
  '1234-56-78/99_12345678901234567-file1:dir2/dir1/file1',
  '1234-56-78/99_12345678901234567-file2:dir2/98_76543210987654321-file2',
  '1234-56-78/99_12345678901234567-file3:dir1/file3',
  '1234-56-78/99_12345678901234567-file4:97_76543210987654321-file4'
];
const recordRegExpDymd = /^(?<ymd>\d{4}\-\d{2}\-\d{2})\/(?<no>\d+)_(?<btime>\d{17})\-(?<newName>.+)\:(?<oldPath>.+)$/;
const expectBeforeTargetFpathList = [
  'file0',
  'dir1/file1',
  'dir2/file2',
  'dir2/dir1/file3',
  'dir2/dir2/file4',
  'dir2/dir2/99_76543210987654321-file0',
  'dir2/dir1/file1',
  'dir2/98_76543210987654321-file2',
  'dir1/file3',
  '97_76543210987654321-file4'
].sort();
const expectBeforeTargetSlpathList = [
  'dir2/dir2/syml0',
  'dir2/dir1/syml1',
  'dir2/syml2',
  'dir1/syml3',
  'syml4'
].sort();
const expectExtraPathList = [
  'extra.d',
  'extra.d/syml4',
  'extra.d/dir1',
  'extra.d/dir1/syml3',
  'extra.d/dir2',
  'extra.d/dir2/syml2',
  'extra.d/dir2/dir1',
  'extra.d/dir2/dir1/syml1',
  'extra.d/dir2/dir2',
  'extra.d/dir2/dir2/syml0'
].sort();

// test log
// test target directory
// test extra directory
const test_not_forced_dy = async () => {
  childProcess.execSync(`node date ./testwork/date_y -d y -s TEST_NOT_FORCED_DY`);
  const targetDpath = path.resolve('./testwork/date_y');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'date_TEST_NOT_FORCED_DY.json'));
  if (info['Target directory'] !== targetDpath) {
    throw new Error(`Target directory: ${info['Target directory']}`);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(`File count: ${info['File count']}`);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new error(`${info['Symbolic link count']}`);
  }
  if (info['Forced'] !== false) {
    throw new Error(`Forced: ${info['Forced']}`);
  }
  if (info['Extra directory'] !== null) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordListDy.length) {
    throw new Error(`${expectRecordListDy.length} !== ${info['Records'].length}`);
  }
  const records = info['Records'].map(testPath => testPath.replaceAll(path.sep, '/'));
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!recordRegExpDy.test(record)) {
      throw new Error(`${record}`);
    }
  }
  const actualRecord_newName_oldPath = records.map(record => {
    const groups = recordRegExpDy.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_newName_oldPath = expectRecordListDy.map(record => {
    const groups = recordRegExpDy.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  for (let i = 0; i < actualRecord_newName_oldPath.length; i++) {
    const actual = actualRecord_newName_oldPath[i];
    const expect = expectRecord_newName_oldPath[i];
    if (actual !== expect) {
      console.log(actual);
      console.log(expect);
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).map(testPath => testPath.replaceAll(path.sep, '/'));
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  const omittedTargetFpaths = targetFpaths.map(testPath => utility.omitPath(testPath, targetDpath)).sort();
  for (let i = 0; i < omittedTargetFpaths.length; i++) {
    if (omittedTargetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).map(testPath => testPath.replaceAll(path.sep, '/'));
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  const omittedTargetSlpaths = targetSlpaths.map(testPath => utility.omitPath(testPath, targetDpath)).sort();
  for (let i = 0; i < omittedTargetSlpaths.length; i++) {
    if (omittedTargetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'date_TEST_NOT_FORCED_DY');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
};

// test log
// test target directory
// test extra directory
const test_forced_dy = async () => {
  childProcess.execSync(`node date ./testwork/date_y -d y -s TEST_FORCED_DY -F`);
  const targetDpath = path.resolve('./testwork/date_y');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'date_TEST_FORCED_DY.json'));
  if (info['Target directory'] !== targetDpath) {
    throw new Error(`Target directory: ${info['Target directory']}`);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(`File count: ${info['File count']}`);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new Error(`Symbolic link count: ${info['Symbolic link count']}`);
  }
  if (info['Forced'] !== true) {
    throw new Error(`Forced: ${info['Forced']}`);
  }
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'date_TEST_FORCED_DY');
  if (info['Extra directory'] !== execIdDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordListDy.length) {
    throw new Error(`${expectRecordListDy.length} !== ${info['Records'].length}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/'));
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!recordRegExpDy.test(record)) {
      throw new Error(`${record}`);
    }
  }
  const actualRecord_newName_oldPath = records.map(record => {
    const groups = recordRegExpDy.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_newName_oldPath = records.map(record => {
    const groups = recordRegExpDy.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  for (let i = 0; i < actualRecord_newName_oldPath.length; i++) {
    const actual = actualRecord_newName_oldPath[i];
    const expect = expectRecord_newName_oldPath[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath);
  if (targetFpaths.length !== expectRecordListDy.length) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath);
  if (targetSlpaths.length !== 0) {
    throw new Error(``);
  }
  const targetPathRegExp = /^(?:.+)\/(?<ymd>\d{4})\/(?<no>\d+)_(?<btime>\d{17})\-(?<name>.+)$/;
  for (let i = 0; i < targetFpaths.length; i++) {
    const testPath = targetFpaths[i];
    if (!targetPathRegExp.test(testPath)) {
      throw new Error(`${testPath}`);
    }
    const groups = targetPathRegExp.exec(testPath).groups;
    if (!groups.btime.startsWith(groups.ymd.replace(/\-/g, ''))) {
      throw new Error(``);
    }
  }
  const actualTargetFpath_name = targetFpaths.map(testPath => {
    const groups = targetPathRegExp.exec(testPath).groups;
    return `${groups.name}`;
  }).sort();
  const expectTargetFpath_name = expectRecordListDy.map(record => {
    const groups = recordRegExpDy.exec(record).groups;
    return `${groups.newName}`;
  }).sort();
  for (let i = 0; i < actualTargetFpath_name.length; i++) {
    const actual = actualTargetFpath_name[i];
    const expect = expectTargetFpath_name[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  // test extra directory
  const extraPaths = utility.getAllPaths(execIdDpath);
  if (extraPaths.length !== expectExtraPathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < extraPaths.length; i++) {
    if (fs.lstatSync(extraPaths[i]).isFile()) {
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

// test log
// test target directory
// test extra directory
const test_not_forced_dym = async () => {
  childProcess.execSync(`node date ./testwork/date_ym -d ym -s TEST_NOT_FORCED_DYM`);
  const targetDpath = path.resolve('./testwork/date_ym');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'date_TEST_NOT_FORCED_DYM.json'));
  if (info['Target directory'] !== targetDpath) {
    throw new Error(`Target directory: ${info['Target directory']}`);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(`File count: ${info['File count']}`);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new error(`${info['Symbolic link count']}`);
  }
  if (info['Forced'] !== false) {
    throw new Error(`Forced: ${info['Forced']}`);
  }
  if (info['Extra directory'] !== null) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordListDym.length) {
    throw new Error(`${expectRecordListDym.length} !== ${info['Records'].length}`);
  }
  const records = info['Records'].map(testPath => testPath.replaceAll(path.sep, '/'));
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!recordRegExpDym.test(record)) {
      throw new Error(`${record}`);
    }
  }
  const actualRecord_newName_oldPath = records.map(record => {
    const groups = recordRegExpDym.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_newName_oldPath = expectRecordListDym.map(record => {
    const groups = recordRegExpDym.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  for (let i = 0; i < actualRecord_newName_oldPath.length; i++) {
    const actual = actualRecord_newName_oldPath[i];
    const expect = expectRecord_newName_oldPath[i];
    if (actual !== expect) {
      console.log(actual);
      console.log(expect);
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath);
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  const omittedTargetFpaths = targetFpaths.map(testPath => utility.omitPath(testPath, targetDpath)).sort();
  for (let i = 0; i < omittedTargetFpaths.length; i++) {
    if (omittedTargetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath);
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  const omittedTargetSlpaths = targetSlpaths.map(testPath => utility.omitPath(testPath, targetDpath)).sort();
  for (let i = 0; i < omittedTargetSlpaths.length; i++) {
    if (omittedTargetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'date_TEST_NOT_FORCED_DYM');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
};

// test log
// test target directory
// test extra directory
const test_forced_dym = async () => {
  childProcess.execSync(`node date ./testwork/date_ym -d ym -s TEST_FORCED_DYM -F`);
  const targetDpath = path.resolve('./testwork/date_ym');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'date_TEST_FORCED_DYM.json'));
  if (info['Target directory'] !== targetDpath) {
    throw new Error(`Target directory: ${info['Target directory']}`);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(`File count: ${info['File count']}`);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new Error(`Symbolic link count: ${info['Symbolic link count']}`);
  }
  if (info['Forced'] !== true) {
    throw new Error(`Forced: ${info['Forced']}`);
  }
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'date_TEST_FORCED_DYM');
  if (info['Extra directory'] !== execIdDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordListDym.length) {
    throw new Error(`${expectRecordListDym.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    const record = info['Records'][i];
    if (!recordRegExpDym.test(record)) {
      throw new Error(`${record}`);
    }
  }
  const actualRecord_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegExpDym.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegExpDym.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  for (let i = 0; i < actualRecord_newName_oldPath.length; i++) {
    const actual = actualRecord_newName_oldPath[i];
    const expect = expectRecord_newName_oldPath[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath);
  if (targetFpaths.length !== expectRecordListDym.length) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath);
  if (targetSlpaths.length !== 0) {
    throw new Error(``);
  }
  const targetPathRegExp = /^(?:.+)\/(?<ymd>\d{4}\-\d{2})\/(?<no>\d+)_(?<btime>\d{17})\-(?<name>.+)$/;
  for (let i = 0; i < targetFpaths.length; i++) {
    const testPath = targetFpaths[i];
    if (!targetPathRegExp.test(testPath)) {
      throw new Error(`${testPath}`);
    }
    const groups = targetPathRegExp.exec(testPath).groups;
    if (!groups.btime.startsWith(groups.ymd.replace(/\-/g, ''))) {
      throw new Error(``);
    }
  }
  const actualTargetFpath_name = targetFpaths.map(testPath => {
    const groups = targetPathRegExp.exec(testPath).groups;
    return `${groups.name}`;
  }).sort();
  const expectTargetFpath_name = expectRecordListDym.map(record => {
    const groups = recordRegExpDym.exec(record).groups;
    return `${groups.newName}`;
  }).sort();
  for (let i = 0; i < actualTargetFpath_name.length; i++) {
    const actual = actualTargetFpath_name[i];
    const expect = expectTargetFpath_name[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  // test extra directory
  const extraPaths = utility.getAllPaths(execIdDpath);
  if (extraPaths.length !== expectExtraPathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < extraPaths.length; i++) {
    if (fs.lstatSync(extraPaths[i]).isFile()) {
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

// test log
// test target directory
// test extra directory
const test_not_forced_dymd = async () => {
  childProcess.execSync(`node date ./testwork/date_ymd -d ymd -s TEST_NOT_FORCED_DYMD`);
  const targetDpath = path.resolve('./testwork/date_ymd');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'date_TEST_NOT_FORCED_DYMD.json'));
  if (info['Target directory'] !== targetDpath) {
    throw new Error(`Target directory: ${info['Target directory']}`);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(`File count: ${info['File count']}`);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new error(`${info['Symbolic link count']}`);
  }
  if (info['Forced'] !== false) {
    throw new Error(`Forced: ${info['Forced']}`);
  }
  if (info['Extra directory'] !== null) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordListDymd.length) {
    throw new Error(`${expectRecordListDymd.length} !== ${info['Records'].length}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/'));
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!recordRegExpDymd.test(record)) {
      throw new Error(`${record}`);
    }
  }
  const actualRecord_newName_oldPath = records.map(record => {
    const groups = recordRegExpDymd.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_newName_oldPath = expectRecordListDymd.map(record => {
    const groups = recordRegExpDymd.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  for (let i = 0; i < actualRecord_newName_oldPath.length; i++) {
    const actual = actualRecord_newName_oldPath[i];
    const expect = expectRecord_newName_oldPath[i];
    if (actual !== expect) {
      console.log(actual);
      console.log(expect);
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath);
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  const omittedTargetFpaths = targetFpaths.map(testPath => utility.omitPath(testPath, targetDpath)).sort();
  for (let i = 0; i < omittedTargetFpaths.length; i++) {
    if (omittedTargetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath);
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  const omittedTargetSlpaths = targetSlpaths.map(testPath => utility.omitPath(testPath, targetDpath)).sort();
  for (let i = 0; i < omittedTargetSlpaths.length; i++) {
    if (omittedTargetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'date_TEST_NOT_FORCED_DYMD');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
};

// test log
// test target directory
// test extra directory
const test_forced_dymd = async () => {
  childProcess.execSync(`node date ./testwork/date_ymd -d ymd -s TEST_FORCED_DYMD -F`);
  const targetDpath = path.resolve('./testwork/date_ymd');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'date_TEST_FORCED_DYMD.json'));
  if (info['Target directory'] !== targetDpath) {
    throw new Error(`Target directory: ${info['Target directory']}`);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(`File count: ${info['File count']}`);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new Error(`Symbolic link count: ${info['Symbolic link count']}`);
  }
  if (info['Forced'] !== true) {
    throw new Error(`Forced: ${info['Forced']}`);
  }
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'date_TEST_FORCED_DYMD');
  if (info['Extra directory'] !== execIdDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordListDymd.length) {
    throw new Error(`${expectRecordListDymd.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    const record = info['Records'][i];
    if (!recordRegExpDymd.test(record)) {
      throw new Error(`${record}`);
    }
  }
  const actualRecord_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegExpDymd.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegExpDymd.exec(record).groups;
    return `${groups.newName}:${groups.oldPath}`;
  }).sort();
  for (let i = 0; i < actualRecord_newName_oldPath.length; i++) {
    const actual = actualRecord_newName_oldPath[i];
    const expect = expectRecord_newName_oldPath[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath);
  if (targetFpaths.length !== expectRecordListDymd.length) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath);
  if (targetSlpaths.length !== 0) {
    throw new Error(``);
  }
  const targetPathRegExp = /^(?:.+)\/(?<ymd>\d{4}\-\d{2}\-\d{2})\/(?<no>\d+)_(?<btime>\d{17})\-(?<name>.+)$/;
  for (let i = 0; i < targetFpaths.length; i++) {
    const testPath = targetFpaths[i];
    if (!targetPathRegExp.test(testPath)) {
      throw new Error(`${testPath}`);
    }
    const groups = targetPathRegExp.exec(testPath).groups;
    if (!groups.btime.startsWith(groups.ymd.replace(/\-/g, ''))) {
      throw new Error(``);
    }
  }
  const actualTargetFpath_name = targetFpaths.map(testPath => {
    const groups = targetPathRegExp.exec(testPath).groups;
    return `${groups.name}`;
  }).sort();
  const expectTargetFpath_name = expectRecordListDymd.map(record => {
    const groups = recordRegExpDymd.exec(record).groups;
    return `${groups.newName}`;
  }).sort();
  for (let i = 0; i < actualTargetFpath_name.length; i++) {
    const actual = actualTargetFpath_name[i];
    const expect = expectTargetFpath_name[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  // test extra directory
  const extraPaths = utility.getAllPaths(execIdDpath);
  if (extraPaths.length !== expectExtraPathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < extraPaths.length; i++) {
    if (fs.lstatSync(extraPaths[i]).isFile()) {
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
  fs.emptyDirSync(baseDpathY);
  utility.generateResourceFiles(baseDpathY, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpathY, resourceSlpaths);
  await test_not_forced_dy();
  await test_forced_dy();

  fs.emptyDirSync(baseDpathYm);
  utility.generateResourceFiles(baseDpathYm, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpathYm, resourceSlpaths);
  await test_not_forced_dym();
  await test_forced_dym();

  fs.emptyDirSync(baseDpathYmd);
  utility.generateResourceFiles(baseDpathYmd, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpathYmd, resourceSlpaths);
  await test_not_forced_dymd();
  await test_forced_dymd();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
