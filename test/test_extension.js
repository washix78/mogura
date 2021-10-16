const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const expectBeforeTargetFpathList = [
  `${process.cwd()}/testwork/extension/file1.html`,
  `${process.cwd()}/testwork/extension/dir1.txt/file2.HTML`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/file5.TXT`,
  `${process.cwd()}/testwork/extension/dir1.txt/file7.`,
  `${process.cwd()}/testwork/extension/dir2.html/dir1/file9`,
  `${process.cwd()}/testwork/extension/file1.xml`,
  `${process.cwd()}/testwork/extension/dir1.txt/file1.XML`,
  `${process.cwd()}/testwork/extension/dir1.txt/file1_2.xml`,
  `${process.cwd()}/testwork/extension/dir2.html/99_12345678901234567-file1.xml`,
  `${process.cwd()}/testwork/extension/dir2.html/dir1/file.1.xml`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/file2.log`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/file2_1.log`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/file2_2.log`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/file2_3.log`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/file2_4.log`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/file2_5.log`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/file2_6.log`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/file2_7.log`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/file2_8.log`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/file2_9.log`,
  `${process.cwd()}/testwork/extension/file3.list`,
  `${process.cwd()}/testwork/extension/file3_1.list`,
  `${process.cwd()}/testwork/extension/file3_2.list`,
  `${process.cwd()}/testwork/extension/file3_3.list`,
  `${process.cwd()}/testwork/extension/file3_4.list`,
  `${process.cwd()}/testwork/extension/file3_5.list`,
  `${process.cwd()}/testwork/extension/file3_6.list`,
  `${process.cwd()}/testwork/extension/file3_7.list`,
  `${process.cwd()}/testwork/extension/file3_8.list`,
  `${process.cwd()}/testwork/extension/file3_9.list`,
  `${process.cwd()}/testwork/extension/file3_0.list`
];
const expectBeforeTargetSlpathList = [
  `${process.cwd()}/testwork/extension/dir2.html/syml3.HTML`,
  `${process.cwd()}/testwork/extension/dir2.html/dir1/syml4.html`,
  `${process.cwd()}/testwork/extension/syml6.txt`,
  `${process.cwd()}/testwork/extension/dir2.html/syml8.`,
  `${process.cwd()}/testwork/extension/dir2.html/dir2/syml0`
];
const expectExtraDpathList = [
  'extra.d',
  'extra.d/dir1.txt',
  'extra.d/dir2.html',
  'extra.d/dir2.html/dir1',
  'extra.d/dir2.html/dir2'
];
const expectRecordList = [
  'HTML/00_12345678901234567-syml3.HTML:dir2.html/syml3.HTML',
  'HTML/01_12345678901234567-syml4.html:dir2.html/dir1/syml4.html',
  'HTML/10_12345678901234567-file1.html:file1.html',
  'HTML/11_12345678901234567-file2.HTML:dir1.txt/file2.HTML',
  'TXT/00_12345678901234567-syml6.txt:syml6.txt',
  'TXT/10_12345678901234567-file5.TXT:dir2.html/dir2/file5.TXT',
  'ext_zero.d/00_12345678901234567-syml8.:dir2.html/syml8.',
  'ext_zero.d/10_12345678901234567-file7.:dir1.txt/file7.',
  'ext_none.d/00_12345678901234567-syml0:dir2.html/dir2/syml0',
  'ext_none.d/10_12345678901234567-file9:dir2.html/dir1/file9',
  'XML/10_12345678901234567-file1.xml:file1.xml',
  'XML/11_12345678901234567-file1.XML:dir1.txt/file1.XML',
  'XML/12_12345678901234567-file1_2.xml:dir1.txt/file1_2.xml',
  'XML/13_12345678901234567-file1.xml:dir2.html/99_12345678901234567-file1.xml',
  'XML/14_12345678901234567-file.1.xml:dir2.html/dir1/file.1.xml',
  'LOG/10_12345678901234567-file2.log:dir2.html/dir2/file2.log',
  'LOG/11_12345678901234567-file2_1.log:dir2.html/dir2/file2_1.log',
  'LOG/12_12345678901234567-file2_2.log:dir2.html/dir2/file2_2.log',
  'LOG/13_12345678901234567-file2_3.log:dir2.html/dir2/file2_3.log',
  'LOG/14_12345678901234567-file2_4.log:dir2.html/dir2/file2_4.log',
  'LOG/15_12345678901234567-file2_5.log:dir2.html/dir2/file2_5.log',
  'LOG/16_12345678901234567-file2_6.log:dir2.html/dir2/file2_6.log',
  'LOG/17_12345678901234567-file2_7.log:dir2.html/dir2/file2_7.log',
  'LOG/18_12345678901234567-file2_8.log:dir2.html/dir2/file2_8.log',
  'LOG/19_12345678901234567-file2_9.log:dir2.html/dir2/file2_9.log',
  'LIST/100_12345678901234567-file3.list:file3.list',
  'LIST/101_12345678901234567-file3_1.list:file3_1.list',
  'LIST/102_12345678901234567-file3_2.list:file3_2.list',
  'LIST/103_12345678901234567-file3_3.list:file3_3.list',
  'LIST/104_12345678901234567-file3_4.list:file3_4.list',
  'LIST/105_12345678901234567-file3_5.list:file3_5.list',
  'LIST/106_12345678901234567-file3_6.list:file3_6.list',
  'LIST/107_12345678901234567-file3_7.list:file3_7.list',
  'LIST/108_12345678901234567-file3_8.list:file3_8.list',
  'LIST/109_12345678901234567-file3_9.list:file3_9.list',
  'LIST/110_12345678901234567-file3_0.list:file3_0.list'
];
const recordRegexp = /^(?<ext>\w+|ext_none\.d|ext_zero\.d)\/(?<type>\d)(?<no>\d+)_\d{17}\-(?<newName>.+)\:(?<oldPath>(?:.+\/)*.+)$/;

/*
 * test target directory
 * test extra directory
 * test log
 */
const test_not_forced = async () => {
  childProcess.execSync(`node extension ./testwork/extension -s TEST_NOT_FORCED`);

  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/extension');
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    const matched = expectBeforeTargetFpathList.filter(expect => expect === targetFpaths[i]);
    if (matched.length !== 1) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/extension');
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    const matched = expectBeforeTargetSlpathList.filter(expect => expect === targetSlpaths[i]);
    if (matched.length !== 1) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'extension_TEST_NOT_FORCED');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'extension_TEST_NOT_FORCED.json'));
  if (info['Target directory'] !== path.resolve('./testwork/extension')) {
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
    if (!recordRegexp.test(record)) {
      throw new Error(`${record}`);
    }
  }
  const actualRecord_ext_type_no = info['Records'].map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.ext}:${groups.type}:${groups.no}`;
  }).sort();
  const expectRecord_ext_type_no = expectRecordList.map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.ext}:${groups.type}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_ext_type_no.length; i++) {
    const actual = actualRecord_ext_type_no[i];
    const expect = expectRecord_ext_type_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualRecord_ext_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.ext}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_ext_newName_oldPath = expectRecordList.map(record => {
    const groups = recordRegexp.exec(record).groups;
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
};

/*
 * test target directory
 * test extra directory
 * test log
 */
const test_forced = async () => {
  childProcess.execSync(`node extension ./testwork/extension -s TEST_FORCED -F`);

  // test target directory
  const targetPaths = utility.getFilePaths('./testwork/extension').concat(utility.getSymbolicLinkPaths('./testwork/extension'));
  if (targetPaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  const targetPathRegexp = /^(?:\/.+)+\/(?<ext>[0-9A-Z]+|ext_none\.d|ext_zero\.d)\/(?<type>\d)(?<no>\d+)_\d{17}\-(?<name>.+)$/;
  for (let i = 0; i < targetPaths.length; i++) {
    const testPath = targetPaths[i];
    if (!targetPathRegexp.test(testPath)) {
      throw new Error(`${testPath}`);
    }
    const actual = targetPathRegexp.exec(testPath).groups;

    if (actual.type === '0') {
      if (!fs.lstatSync(testPath).isSymbolicLink()) {
        throw new Error(`${testPath}`);
      }
    } else if (actual.type === '1') {
      if (!fs.lstatSync(testPath).isFile()) {
        throw new Error(`${testPath}`);
      }
    } else {
      throw new Error(`${testPath}`);
    }
  }
  const actualTargetPath_ext_type_name = targetPaths.map(testPath => {
    const groups = targetPathRegexp.exec(testPath).groups;
    return `${groups.ext}:${groups.type}:${groups.name}`;
  }).sort();
  const expectTargetPath_ext_type_name = expectRecordList.map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.ext}:${groups.type}:${groups.newName}`;
  }).sort();
  for (let i = 0; i < actualTargetPath_ext_type_name.length; i++) {
    const actual = actualTargetPath_ext_type_name[i];
    const expect = expectTargetPath_ext_type_name[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualTargetPath_ext_type_no = targetPaths.map(testPath => {
    const groups = targetPathRegexp.exec(testPath).groups;
    return `${groups.ext}:${groups.type}:${groups.no}`;
  }).sort();
  const expectTargetPath_ext_type_no = expectRecordList.map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.ext}:${groups.type}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualTargetPath_ext_type_no.length; i++) {
    const actual = actualTargetPath_ext_type_no[i];
    const expect = expectTargetPath_ext_type_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'extension_TEST_FORCED');
  const extraPaths = utility.getAllPaths(execIdDpath);
  if (extraPaths.length !== expectExtraDpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < extraPaths.length; i++) {
    if (!fs.lstatSync(extraPaths[i]).isDirectory()) {
      throw new Error(``);
    }
    const omitted = utility.omitPath(extraPaths[i], execIdDpath);
    const matched = expectExtraDpathList.filter(expect => expect === omitted);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'extension_TEST_FORCED.json'));
  if (info['Target directory'] !== path.resolve('./testwork/extension')) {
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
  if (info['Extra directory'] !== execIdDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(`${expectRecordList.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    const record = info['Records'][i];
    if (!recordRegexp.test(record)) {
      throw new Error(`${record}`);
    }
  }
  const actualRecord_ext_type_no = info['Records'].map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.ext}:${groups.type}:${groups.no}`;
  }).sort();
  const expectRecord_ext_type_no = expectRecordList.map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.ext}:${groups.type}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_ext_type_no.length; i++) {
    const actual = actualRecord_ext_type_no[i];
    const expect = expectRecord_ext_type_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualRecord_ext_type_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.ext}:${groups.type}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_ext_type_newName_oldPath = info['Records'].map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.ext}:${groups.type}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  for (let i = 0; i < actualRecord_ext_type_newName_oldPath.length; i++) {
    const actual = actualRecord_ext_type_newName_oldPath[i];
    const expect = expectRecord_ext_type_newName_oldPath[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
};

const main = async () => {
  fs.emptyDirSync('./testwork/extension');
  fs.copySync('./test/resources/extension', './testwork/extension');

  await test_not_forced();
  await test_forced();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
