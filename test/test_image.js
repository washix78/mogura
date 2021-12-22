const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const baseDpath = path.resolve(process.cwd(), 'testwork/image');

const resourceFpaths = [
  'file_0:file_0',
  'file_0:dir1/file_0.EXT',
  'file_10_00:dir2/file_10',
  'file_10_00:dir2/dir1/file_10.EXT',
  'file_bmp:file_bmp.EXT',
  'file_bmp:dir2/dir2/file_bmp',
  'file_jpg:file_jpg',
  'file_jpg:dir1/file_jpg.EXT',
  'file_gif1:dir1/file_gif1',
  'file_gif1:dir2/file_gif1.EXT',
  'file_gif2:dir2/dir1/file_gif2',
  'file_gif2:dir2/dir2/file_gif2.EXT',
  'file_png:dir2/file_png',
  'file_png:dir2/dir1/file_png.EXT'
];
const resourceSlpaths = [
  'file_0:syml_0.EXT',
  'file_0:dir2/dir2/syml_0',
  'file_10_00:dir1/syml_10',
  'file_10_00:dir2/syml_10.EXT',
  'file_gif1:syml_gif1',
  'file_gif1:dir1/syml_gif1.EXT',
  'file_gif2:dir2/syml_gif2',
  'file_gif2:dir2/dir1/syml_gif2.EXT',
  'file_jpg:syml_jpg.EXT',
  'file_jpg:dir2/dir2/syml_jpg',
  'file_png:dir1/syml_png',
  'file_png:dir2/syml_png.EXT',
  'file_bmp:dir2/dir1/syml_bmp',
  'file_bmp:dir2/dir2/syml_bmp.EXT'
];

const expectRecordList = [
  'BMP/0_12345678901234567-file_bmp.bmp:file_bmp.EXT',
  'BMP/1_12345678901234567-file_bmp.bmp:dir2/dir2/file_bmp',
  'JPG/0_12345678901234567-file_jpg.jpg:file_jpg',
  'JPG/1_12345678901234567-file_jpg.jpg:dir1/file_jpg.EXT',
  'GIF/0_12345678901234567-file_gif1.gif:dir1/file_gif1',
  'GIF/1_12345678901234567-file_gif1.gif:dir2/file_gif1.EXT',
  'GIF/2_12345678901234567-file_gif2.gif:dir2/dir1/file_gif2',
  'GIF/3_12345678901234567-file_gif2.gif:dir2/dir2/file_gif2.EXT',
  'PNG/0_12345678901234567-file_png.png:dir2/file_png',
  'PNG/1_12345678901234567-file_png.png:dir2/dir1/file_png.EXT',
  'binary.d/0_12345678901234567-file_0:file_0',
  'binary.d/1_12345678901234567-file_0.EXT:dir1/file_0.EXT',
  'binary.d/2_12345678901234567-file_10:dir2/file_10',
  'binary.d/3_12345678901234567-file_10.EXT:dir2/dir1/file_10.EXT'
];
const recordRegExp = /^(?<ext>.+)\/(?<no>\d+)_\d{17}\-(?<newName>.+)\:(?<oldPath>.+)$/;
const expectBeforeTargetFpathList = [
  'file_0',
  'file_bmp.EXT',
  'file_jpg',
  'dir1/file_0.EXT',
  'dir1/file_gif1',
  'dir1/file_jpg.EXT',
  'dir2/file_10',
  'dir2/file_gif1.EXT',
  'dir2/file_png',
  'dir2/dir1/file_10.EXT',
  'dir2/dir1/file_gif2',
  'dir2/dir1/file_png.EXT',
  'dir2/dir2/file_bmp',
  'dir2/dir2/file_gif2.EXT'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectBeforeTargetSLpathList = [
  'syml_0.EXT',
  'syml_gif1',
  'syml_jpg.EXT',
  'dir1/syml_10',
  'dir1/syml_gif1.EXT',
  'dir1/syml_png',
  'dir2/syml_10.EXT',
  'dir2/syml_gif2',
  'dir2/syml_png.EXT',
  'dir2/dir1/syml_bmp',
  'dir2/dir1/syml_gif2.EXT',
  'dir2/dir2/syml_0',
  'dir2/dir2/syml_bmp.EXT',
  'dir2/dir2/syml_jpg'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectExtraPathList = [
  'extra.d',
  'extra.d/syml_0.EXT',
  'extra.d/syml_gif1',
  'extra.d/syml_jpg.EXT',
  'extra.d/dir1',
  'extra.d/dir1/syml_10',
  'extra.d/dir1/syml_gif1.EXT',
  'extra.d/dir1/syml_png',
  'extra.d/dir2',
  'extra.d/dir2/syml_10.EXT',
  'extra.d/dir2/syml_gif2',
  'extra.d/dir2/syml_png.EXT',
  'extra.d/dir2/dir1',
  'extra.d/dir2/dir1/syml_bmp',
  'extra.d/dir2/dir1/syml_gif2.EXT',
  'extra.d/dir2/dir2',
  'extra.d/dir2/dir2/syml_0',
  'extra.d/dir2/dir2/syml_bmp.EXT',
  'extra.d/dir2/dir2/syml_jpg'
].sort();

// test log
// test target directory
// test extra directory
const test_not_forced = async () => {
  childProcess.execSync(`node image ./testwork/image -s TEST_NOT_FORCED`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'image_TEST_NOT_FORCED.json'));
  if (info['Target directory'] !== baseDpath) {
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
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/'));
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!recordRegExp.test(record)) {
      throw new Error(``);
    }
  }
  const actualRecord_ext_no = records.map(record => {
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
  const actualRecord_ext_newName_oldPath = records.map(record => {
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
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/image').sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(``);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/image').sort();
  if (targetSlpaths.length !== expectBeforeTargetSLpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSLpathList[i]) {
      throw new Error(``);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'image_TEST_NOT_FORCED');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
};

// test log
// test target directory
// test extra directory
const test_forced = async () => {
  childProcess.execSync(`node image ./testwork/image -s TEST_FORCED -F`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'image_TEST_FORCED.json'));
  if (info['Target directory'] !== baseDpath) {
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
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'image_TEST_FORCED');
  if (info['Extra directory'] !== execIdDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(`${expectRecordList.length} !== ${info['Records'].length}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/'));
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!recordRegExp.test(record)) {
      throw new Error(``);
    }
  }
  const actualRecord_ext_no = records.map(record => {
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
  const actualRecord_ext_newName_oldPath = records.map(record => {
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
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }

  // test target directory
  const targetPaths = utility.getFilePaths('./testwork/image').concat(
    utility.getSymbolicLinkPaths('./testwork/image')
  );
  if (targetPaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  const targetPathRegExp = /^(?:.+)\/(?<ext>.+)\/(?<no>\d+)_\d{17}\-(?<name>.+)$/;
  for (let i = 0; i < targetPaths.length; i++) {
    const testPath = targetPaths[i];
    if (!targetPathRegExp.test(testPath)) {
      throw new Error(``);
    }
  }
  const actualTargetPath_ext_name = targetPaths.map(testPath => {
    const groups = targetPathRegExp.exec(testPath).groups;
    return `${groups.ext}:${groups.name}`;
  }).sort();
  const expectTargetPath_ext_name = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.ext}:${groups.newName}`;
  }).sort();
  for (let i = 0; i < actualTargetPath_ext_name.length; i++) {
    const actual = actualTargetPath_ext_name[i];
    const expect = expectTargetPath_ext_name[i];
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
  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);

  await test_not_forced();
  await test_forced();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
