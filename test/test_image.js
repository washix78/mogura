const childProcess = require('child_process');
const fs = require('fs-extra');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const expectBeforeTargetFpathList = [
  `${process.cwd()}/testwork/image/file_0`,
  `${process.cwd()}/testwork/image/file_bmp.EXT`,
  `${process.cwd()}/testwork/image/file_jpg`,
  `${process.cwd()}/testwork/image/dir1/file_0.EXT`,
  `${process.cwd()}/testwork/image/dir1/file_gif1`,
  `${process.cwd()}/testwork/image/dir1/file_jpg.EXT`,
  `${process.cwd()}/testwork/image/dir2/file_10`,
  `${process.cwd()}/testwork/image/dir2/file_gif1.EXT`,
  `${process.cwd()}/testwork/image/dir2/file_png`,
  `${process.cwd()}/testwork/image/dir2/dir1/file_10.EXT`,
  `${process.cwd()}/testwork/image/dir2/dir1/file_gif2`,
  `${process.cwd()}/testwork/image/dir2/dir1/file_png.EXT`,
  `${process.cwd()}/testwork/image/dir2/dir2/file_bmp`,
  `${process.cwd()}/testwork/image/dir2/dir2/file_gif2.EXT`
];
const expectBeforeTargetSLpathList = [
  `${process.cwd()}/testwork/image/syml_0.EXT`,
  `${process.cwd()}/testwork/image/syml_gif1`,
  `${process.cwd()}/testwork/image/syml_jpg.EXT`,
  `${process.cwd()}/testwork/image/dir1/syml_10`,
  `${process.cwd()}/testwork/image/dir1/syml_gif1.EXT`,
  `${process.cwd()}/testwork/image/dir1/syml_png`,
  `${process.cwd()}/testwork/image/dir2/syml_10.EXT`,
  `${process.cwd()}/testwork/image/dir2/syml_gif2`,
  `${process.cwd()}/testwork/image/dir2/syml_png.EXT`,
  `${process.cwd()}/testwork/image/dir2/dir1/syml_bmp`,
  `${process.cwd()}/testwork/image/dir2/dir1/syml_gif2.EXT`,
  `${process.cwd()}/testwork/image/dir2/dir2/syml_0`,
  `${process.cwd()}/testwork/image/dir2/dir2/syml_bmp.EXT`,
  `${process.cwd()}/testwork/image/dir2/dir2/syml_jpg`
];
const expectExtraDpathList = [
  'extra.d',
  'extra.d/dir1',
  'extra.d/dir2',
  'extra.d/dir2/dir1',
  'extra.d/dir2/dir2'
];
const expectRecordList = [
  'BMP/10_12345678901234567-file_bmp.bmp:file_bmp.EXT',
  'BMP/11_12345678901234567-file_bmp.bmp:dir2/dir2/file_bmp',
  'JPG/10_12345678901234567-file_jpg.jpg:file_jpg',
  'JPG/11_12345678901234567-file_jpg.jpg:dir1/file_jpg.EXT',
  'GIF/10_12345678901234567-file_gif1.gif:dir1/file_gif1',
  'GIF/11_12345678901234567-file_gif1.gif:dir2/file_gif1.EXT',
  'GIF/12_12345678901234567-file_gif2.gif:dir2/dir1/file_gif2',
  'GIF/13_12345678901234567-file_gif2.gif:dir2/dir2/file_gif2.EXT',
  'PNG/10_12345678901234567-file_png.png:dir2/file_png',
  'PNG/11_12345678901234567-file_png.png:dir2/dir1/file_png.EXT',
  'binary.d/10_12345678901234567-file_0:file_0',
  'binary.d/11_12345678901234567-file_0.EXT:dir1/file_0.EXT',
  'binary.d/12_12345678901234567-file_10:dir2/file_10',
  'binary.d/13_12345678901234567-file_10.EXT:dir2/dir1/file_10.EXT',
  'syml.d/000_12345678901234567-syml_0:dir2/dir2/syml_0',
  'syml.d/001_12345678901234567-syml_0.EXT:syml_0.EXT',
  'syml.d/002_12345678901234567-syml_10:dir1/syml_10',
  'syml.d/003_12345678901234567-syml_10.EXT:dir2/syml_10.EXT',
  'syml.d/004_12345678901234567-syml_bmp:dir2/dir1/syml_bmp',
  'syml.d/005_12345678901234567-syml_bmp.EXT:dir2/dir2/syml_bmp.EXT',
  'syml.d/006_12345678901234567-syml_gif1:syml_gif1',
  'syml.d/007_12345678901234567-syml_gif1.EXT:dir1/syml_gif1.EXT',
  'syml.d/008_12345678901234567-syml_gif2:dir2/syml_gif2',
  'syml.d/009_12345678901234567-syml_gif2.EXT:dir2/dir1/syml_gif2.EXT',
  'syml.d/010_12345678901234567-syml_jpg:dir2/dir2/syml_jpg',
  'syml.d/011_12345678901234567-syml_jpg.EXT:syml_jpg.EXT',
  'syml.d/012_12345678901234567-syml_png:dir1/syml_png',
  'syml.d/013_12345678901234567-syml_png.EXT:dir2/syml_png.EXT'
];
// const recordRegexp = /^(?<digest>[0-9a-z]{32}_[0-9a-z]{40})\/(?<type>\d)(?<no>\d+)_\d{17}\-(?<newName>.+)\:(?<oldPath>(?:.+\/)*.+)$/;
const recordRegexp = /^(?<ext>.+)\/(?<type>\d)(?<no>\d+)_\d{17}\-(?<newName>.+)\:(?<oldPath>.+)$/;

/*
 * test target directory
 * test extra directory
 * test log
 */
const test_not_forced = async () => {
  childProcess.execSync(`node image ./testwork/image -s TEST_NOT_FORCED`);

  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/image');
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    const matched = expectBeforeTargetFpathList.filter(expect => expect === targetFpaths[i]);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/image');
  if (targetSlpaths.length !== expectBeforeTargetSLpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    const matched = expectBeforeTargetSLpathList.filter(expect => expect === targetSlpaths[i]);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'image_TEST_NOT_FORCED');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'image_TEST_NOT_FORCED.json'));
  if (info['Target directory'] !== `${process.cwd()}/testwork/image`) {
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
    if (!recordRegexp.test(record)) {
      throw new Error(``);
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
 * test log
 * test extra directory
 */
const test_forced = async () => {
  childProcess.execSync(`node image ./testwork/image -s TEST_FORCED -F`);

  // test target directory
  const targetPaths = utility.getFilePaths('./testwork/image').concat(
    utility.getSymbolicLinkPaths('./testwork/image')
  );
  if (targetPaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  const targetPathRegexp = /^(?:\/.+)+\/(?<ext>.+)\/(?<type>\d)(?<no>\d+)_\d{17}\-(?<name>.+)$/;
  for (let i = 0; i < targetPaths.length; i++) {
    const testPath = targetPaths[i];
    if (!targetPathRegexp.test(testPath)) {
      throw new Error(``);
    }
    const actual = targetPathRegexp.exec(testPath).groups;
    if (actual.type === '0') {
      if (!fs.lstatSync(testPath).isSymbolicLink()) {
        throw new Error(``);
      }
    } else if (actual.type === '1') {
      if (!fs.lstatSync(testPath).isFile()) {
        throw new Error(``);
      }
    } else {
      throw new Error(``);
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
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'image_TEST_FORCED');
  const extraPaths = utility.getAllPaths(execIdDpath);
  if (extraPaths.length !== expectExtraDpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < extraPaths.length; i++) {
    const testPath = extraPaths[i];
    if (!fs.lstatSync(testPath).isDirectory()) {
      throw new Error(``);
    }
    if (utility.omitPath(testPath, execIdDpath) !== expectExtraDpathList[i]) {
      throw new Error(``);
    }
  }
  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'image_TEST_FORCED.json'));
  if (info['Target directory'] !== `${process.cwd()}/testwork/image`) {
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
  if (info['Extra directory'] !== execIdDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(`${expectRecordList.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    const record = info['Records'][i];
    if (!recordRegexp.test(record)) {
      throw new Error(``);
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

const main = async () => {
  fs.emptyDirSync('./testwork/image');
  fs.copySync('./test/resources/image', './testwork/image');

  await test_not_forced();
  await test_forced();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
