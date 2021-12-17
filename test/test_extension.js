const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const baseDpath = path.resolve(process.cwd(), 'testwork/extension');

const resourceFpaths = [
  'file0:file0_0',
  'file0:dir1.txt/file0_1',
  'file0:dir2.html/file0_2',
  'file0:dir2.html/dir1/file0_3',
  'file0:dir2.html/dir2/file0_4',
  'file0:file0_5',
  'file0:dir1.txt/file0_6',
  'file0:dir2.html/file0_7',
  'file0:dir2.html/dir1/file0_8',
  'file0:dir2.html/dir2/file0_9',
  'file1:file1_00.',
  'file1:dir1.txt/file1_01.',
  'file1:dir2.html/file1_02.',
  'file1:dir2.html/dir1/file1_03.',
  'file1:dir2.html/dir2/file1_04.',
  'file1:file1_05.',
  'file1:dir1.txt/file1_06.',
  'file1:dir2.html/file1_07.',
  'file1:dir2.html/dir1/file1_08.',
  'file1:dir2.html/dir2/file1_09.',
  'file1:file1_10.',
  'file3:dir1.txt/file3.xml',
  'file3:dir2.html/file3.xml',
  'file3:dir2.html/dir1/99_76543210987654321-00_12345678901234567-file3.xml',
  'file3:dir2.html/dir2/file3.x.xml',
  'file4:file4_0.TXT',
  'file4:dir1.txt/file4_1.txt',
  'file4:dir2.html/file4_2.TXT',
  'file5:dir2.html/dir1/file5_0.html',
  'file5:dir2.html/dir2/file5_1.HTML',
  'file5:file5_2.html'
];
const resourceSlpaths = [
  'file6:dir1.txt/syml6',
  'file7:dir2.html/syml7.',
  'file8:dir2.html/dir1/syml8.txt',
  'file9:dir2.html/dir2/syml9.HTML'
];

const expectRecordList = [
  'ext_none.d/0_12345678901234567-file0_0:file0_0',
  'ext_none.d/1_12345678901234567-file0_1:dir1.txt/file0_1',
  'ext_none.d/2_12345678901234567-file0_2:dir2.html/file0_2',
  'ext_none.d/3_12345678901234567-file0_3:dir2.html/dir1/file0_3',
  'ext_none.d/4_12345678901234567-file0_4:dir2.html/dir2/file0_4',
  'ext_none.d/5_12345678901234567-file0_5:file0_5',
  'ext_none.d/6_12345678901234567-file0_6:dir1.txt/file0_6',
  'ext_none.d/7_12345678901234567-file0_7:dir2.html/file0_7',
  'ext_none.d/8_12345678901234567-file0_8:dir2.html/dir1/file0_8',
  'ext_none.d/9_12345678901234567-file0_9:dir2.html/dir2/file0_9',
  'ext_zero.d/00_12345678901234567-file1_00.:file1_00.',
  'ext_zero.d/01_12345678901234567-file1_01.:dir1.txt/file1_01.',
  'ext_zero.d/02_12345678901234567-file1_02.:dir2.html/file1_02.',
  'ext_zero.d/03_12345678901234567-file1_03.:dir2.html/dir1/file1_03.',
  'ext_zero.d/04_12345678901234567-file1_04.:dir2.html/dir2/file1_04.',
  'ext_zero.d/05_12345678901234567-file1_05.:file1_05.',
  'ext_zero.d/06_12345678901234567-file1_06.:dir1.txt/file1_06.',
  'ext_zero.d/07_12345678901234567-file1_07.:dir2.html/file1_07.',
  'ext_zero.d/08_12345678901234567-file1_08.:dir2.html/dir1/file1_08.',
  'ext_zero.d/09_12345678901234567-file1_09.:dir2.html/dir2/file1_09.',
  'ext_zero.d/10_12345678901234567-file1_10.:file1_10.',
  'XML/0_12345678901234567-file3.xml:dir1.txt/file3.xml',
  'XML/1_12345678901234567-file3.xml:dir2.html/file3.xml',
  'XML/2_12345678901234567-00_12345678901234567-file3.xml:dir2.html/dir1/99_76543210987654321-00_12345678901234567-file3.xml',
  'XML/3_12345678901234567-file3.x.xml:dir2.html/dir2/file3.x.xml',
  'TXT/0_12345678901234567-file4_0.TXT:file4_0.TXT',
  'TXT/1_12345678901234567-file4_1.txt:dir1.txt/file4_1.txt',
  'TXT/2_12345678901234567-file4_2.TXT:dir2.html/file4_2.TXT',
  'HTML/0_12345678901234567-file5_0.html:dir2.html/dir1/file5_0.html',
  'HTML/1_12345678901234567-file5_1.HTML:dir2.html/dir2/file5_1.HTML',
  'HTML/2_12345678901234567-file5_2.html:file5_2.html'
];
const recordRegExp = /^(?<ext>\w+|ext_none\.d|ext_zero\.d)\/(?<no>\d+)_\d{17}\-(?<newName>.+)\:(?<oldPath>.+)$/;
const expectBeforeTargetFpathList = [
  'file0_0',
  'dir1.txt/file0_1',
  'dir2.html/file0_2',
  'dir2.html/dir1/file0_3',
  'dir2.html/dir2/file0_4',
  'file0_5',
  'dir1.txt/file0_6',
  'dir2.html/file0_7',
  'dir2.html/dir1/file0_8',
  'dir2.html/dir2/file0_9',
  'file1_00.',
  'dir1.txt/file1_01.',
  'dir2.html/file1_02.',
  'dir2.html/dir1/file1_03.',
  'dir2.html/dir2/file1_04.',
  'file1_05.',
  'dir1.txt/file1_06.',
  'dir2.html/file1_07.',
  'dir2.html/dir1/file1_08.',
  'dir2.html/dir2/file1_09.',
  'file1_10.',
  'dir1.txt/file3.xml',
  'dir2.html/file3.xml',
  'dir2.html/dir1/99_76543210987654321-00_12345678901234567-file3.xml',
  'dir2.html/dir2/file3.x.xml',
  'file4_0.TXT',
  'dir1.txt/file4_1.txt',
  'dir2.html/file4_2.TXT',
  'dir2.html/dir1/file5_0.html',
  'dir2.html/dir2/file5_1.HTML',
  'file5_2.html'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectBeforeTargetSlpathList = [
  'dir1.txt/syml6',
  'dir2.html/syml7.',
  'dir2.html/dir1/syml8.txt',
  'dir2.html/dir2/syml9.HTML'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectExtraPathList = [
  'extra.d',
  'extra.d/dir1.txt',
  'extra.d/dir1.txt/syml6',
  'extra.d/dir2.html',
  'extra.d/dir2.html/syml7.',
  'extra.d/dir2.html/dir1',
  'extra.d/dir2.html/dir1/syml8.txt',
  'extra.d/dir2.html/dir2',
  'extra.d/dir2.html/dir2/syml9.HTML'
].sort();

/*
 * test log
 * test target directory
 * test extra directory
 */
const test_not_forced = async () => {
  childProcess.execSync(`node extension ./testwork/extension -s TEST_NOT_FORCED`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'extension_TEST_NOT_FORCED.json'));
  if (info['Target directory'] !== baseDpath) {
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
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(`${expectRecordList.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    const record = info['Records'][i];
    if (!recordRegExp.test(record)) {
      throw new Error(`${record}`);
    }
  }
  const actualRecord_ext_no = info['Records'].map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.ext}:${groups.no}`;
  }).sort();
  const expectRecord_ext_no = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.ext}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_ext_no.length; i++) {
    const actual = actualRecord_ext_no[i];
    const expect = expectRecord_ext_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualRecord_ext_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.ext}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_ext_newName_oldPath = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.ext}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  for (let i = 0; i < actualRecord_ext_newName_oldPath.length; i++) {
    const actual = actualRecord_ext_newName_oldPath[i];
    const expect = expectRecord_ext_newName_oldPath[i];
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
  const targetFpaths = utility.getFilePaths('./testwork/extension').sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/extension').sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'extension_TEST_NOT_FORCED');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
};

/*
 * test log
 * test target directory
 * test extra directory
 */
const test_forced = async () => {
  childProcess.execSync(`node extension ./testwork/extension -s TEST_FORCED -F`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'extension_TEST_FORCED.json'));
  if (info['Target directory'] !== baseDpath) {
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
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'extension_TEST_FORCED');
  if (info['Extra directory'] !== execIdDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(`${expectRecordList.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    const record = info['Records'][i];
    if (!recordRegExp.test(record)) {
      throw new Error(`${record}`);
    }
  }
  const actualRecord_ext_no = info['Records'].map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.ext}:${groups.no}`;
  }).sort();
  const expectRecord_ext_no = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.ext}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_ext_no.length; i++) {
    const actual = actualRecord_ext_no[i];
    const expect = expectRecord_ext_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualRecord_ext_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.ext}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_ext_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.ext}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  for (let i = 0; i < actualRecord_ext_newName_oldPath.length; i++) {
    const actual = actualRecord_ext_newName_oldPath[i];
    const expect = expectRecord_ext_newName_oldPath[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/extension');
  if (targetFpaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/extension');
  if (targetSlpaths.length !== 0) {
    throw new Error(``);
  }
  const targetPathRegExp = /^(?:.+)\/(?<ext>\w+|ext_none\.d|ext_zero\.d)\/(?<no>\d+)_\d{17}\-(?<name>.+)$/;
  for (let i = 0; i < targetFpaths.length; i++) {
    const testPath = targetFpaths[i];
    if (!targetPathRegExp.test(testPath)) {
      throw new Error(`${testPath}`);
    }
  }
  const actualTargetFpath_ext_name = targetFpaths.map(testPath => {
    const groups = targetPathRegExp.exec(testPath).groups;
    return `${groups.ext}:${groups.name}`;
  }).sort();
  const expectTargetFpath_ext_name = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.ext}:${groups.newName}`;
  }).sort();
  for (let i = 0; i < actualTargetFpath_ext_name.length; i++) {
    const actual = actualTargetFpath_ext_name[i];
    const expect = expectTargetFpath_ext_name[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualTargetFpath_ext_no = targetFpaths.map(testPath => {
    const groups = targetPathRegExp.exec(testPath).groups;
    return `${groups.ext}:${groups.no}`;
  }).sort();
  const expectTargetFpath_ext_no = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.ext}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualTargetFpath_ext_no.length; i++) {
    const actual = actualTargetFpath_ext_no[i];
    const expect = expectTargetFpath_ext_no[i];
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
  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);

  await test_not_forced();
  await test_forced();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
