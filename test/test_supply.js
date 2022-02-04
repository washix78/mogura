const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const baseDpath = path.resolve(process.cwd(), 'testwork/supply_base');
const targetDpath = path.resolve(process.cwd(), 'testwork/supply_target');

const resourceBaseFpaths = [
  'file0:file0',
  'file1:dir1/file1',
  'file3:dir2/file3',
  'file4:dir2/dir1/file4_0',
  'file4:dir2/dir2/file4_1'
];
const resourceBaseSlpaths = [
  'file0:syml0',
  'file1:dir1/syml1',
  'file3:dir2/syml3',
  'file4:dir2/dir1/syml4_0',
  'file4:dir2/dir2/syml4_1'
];
const resourceTargetFpaths = [
  'file0:dir2/dir2/file0',
  'file2:dir2/dir1/file2',
  'file3:dir2/file3_0',
  'file3:dir1/file3_1',
  'file5:file5_0',
  'file5:dir2/dir2/file5_1'
];
const resourceTargetSlpaths = [
  'file0:dir2/dir1/syml0',
  'file2:dir2/syml2',
  'file3:dir1/syml3_0',
  'file3:syml3_1',
  'file5:dir2/dir2/syml5_0',
  'file5:dir2/dir1/syml5_1'
];

const expectRecordList = [
  'dir2/dir1/file2',
  'file5_0',
  'dir2/dir2/file5_1'
].sort();
const expectBaseFpathList = [
  'file0',
  'dir1/file1',
  'dir2/file3',
  'dir2/dir1/file4_0',
  'dir2/dir2/file4_1'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectBaseSlpathList = [
  'syml0',
  'dir1/syml1',
  'dir2/syml3',
  'dir2/dir1/syml4_0',
  'dir2/dir2/syml4_1'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectBeforeTargetFpathList = [
  'dir2/dir2/file0',
  'dir2/dir1/file2',
  'dir2/file3_0',
  'dir1/file3_1',
  'file5_0',
  'dir2/dir2/file5_1'
].map(testPath => path.resolve(targetDpath, testPath)).sort();
const expectBeforeTargetSlpathList = [
  'dir2/dir1/syml0',
  'dir2/syml2',
  'dir1/syml3_0',
  'syml3_1',
  'dir2/dir2/syml5_0',
  'dir2/dir1/syml5_1'
].map(testPath => path.resolve(targetDpath, testPath)).sort();

// test log
// test base directory
// test target directory
// test extra directory
const test_not_forced = async () => {
  childProcess.execSync(`node supply ./testwork/supply_base ./testwork/supply_target -s TEST_NOT_FORCED`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'supply_TEST_NOT_FORCED.json'));
  if (info['Base directory'] !== baseDpath) {
    throw new Error(``);
  }
  if (info['Base file count'] !== expectBaseFpathList.length) {
    throw new Error(``);
  }
  if (info['Base symbolic link count'] !== expectBaseSlpathList.length) {
    throw new Error(`${info['Base symbolic link count']} !== ${expectBaseSlpathList.length}`);
  }
  if (info['Target directory'] !== targetDpath) {
    throw new Error(``);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new Error(``);
  }
  if (info['Forced'] !== false) {
    throw new Error(``);
  }
  if (info['Extra directory'] !== null) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordList, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test base directory
  const baseFpaths = utility.getFilePaths('./testwork/supply_base').sort();
  if (!utility.equalsArray(baseFpaths, expectBaseFpathList)) {
    throw new Error(``);
  }
  const baseSlpaths = utility.getSymbolicLinkPaths('./testwork/supply_base').sort();
  if (!utility.equalsArray(baseSlpaths, expectBaseSlpathList)) {
    throw new Error(``);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/supply_target').sort();
  if (!utility.equalsArray(targetFpaths, expectBeforeTargetFpathList)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/supply_target').sort();
  if (!utility.equalsArray(targetSlpaths, expectBeforeTargetSlpathList)) {
    throw new Error(``);
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'supply_TEST_NOT_FORCED');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
};

// test log
// test base directory
// test target directory
// test extra directory
const test_forced = async () => {
  childProcess.execSync(`node supply ./testwork/supply_base ./testwork/supply_target -s TEST_FORCED -F`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'supply_TEST_FORCED.json'));
  if (info['Base directory'] !== baseDpath) {
    throw new Error(``);
  }
  if (info['Base file count'] !== expectBaseFpathList.length) {
    throw new Error(``);
  }
  if (info['Base symbolic link count'] !== expectBaseSlpathList.length) {
    throw new Error(``);
  }
  if (info['Target directory'] !== targetDpath) {
    throw new Error(``);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new Error(``);
  }
  if (info['Forced'] !== true) {
    throw new Error(`${info['Forced']}`);
  }
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'supply_TEST_FORCED');
  if (info['Extra directory'] !== execIdDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordList, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test base directory
  const baseFpaths = utility.getFilePaths('./testwork/supply_base').sort();
  if (!utility.equalsArray(baseFpaths, expectBaseFpathList)) {
    throw new Error(``);
  }
  const baseSlpaths = utility.getSymbolicLinkPaths('./testwork/supply_base').sort();
  if (!utility.equalsArray(baseSlpaths, expectBaseSlpathList)) {
    throw new Error(``);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/supply_target').sort();
  if (!utility.equalsArray(targetFpaths, expectBeforeTargetFpathList)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/supply_target').sort();
  if (!utility.equalsArray(targetSlpaths, expectBeforeTargetSlpathList)) {
    throw new Error(``);
  }
  // test extra directory
  const extraPaths = utility.getFilePaths(execIdDpath).
    concat(utility.getSymbolicLinkPaths(execIdDpath)).
    map(testPath => utility.omitPath(testPath, execIdDpath).replaceAll(path.sep, '/')).
    sort();
  if (!utility.equalsArray(extraPaths, expectRecordList)) {
    throw new Error(``);
  }
};

// test log
// test base directory
// test target directory
// test extra directory
const test_not_forced_dp = async () => {
  childProcess.execSync(
    `node supply ./testwork/supply_base ./testwork/supply_target -s TEST_NOT_FORCED_DP -dp ./testwork/supply_dp`
  );

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'supply_TEST_NOT_FORCED_DP.json'));
  if (info['Base directory'] !== baseDpath) {
    throw new Error(``);
  }
  if (info['Base file count'] !== expectBaseFpathList.length) {
    throw new Error(``);
  }
  if (info['Base symbolic link count'] !== expectBaseSlpathList.length) {
    throw new Error(`${info['Base symbolic link count']} !== ${expectBaseSlpathList.length}`);
  }
  if (info['Target directory'] !== targetDpath) {
    throw new Error(``);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new Error(``);
  }
  if (info['Forced'] !== false) {
    throw new Error(``);
  }
  if (info['Extra directory'] !== null) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordList, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test base directory
  const baseFpaths = utility.getFilePaths('./testwork/supply_base').sort();
  if (!utility.equalsArray(baseFpaths, expectBaseFpathList)) {
    throw new Error(``);
  }
  const baseSlpaths = utility.getSymbolicLinkPaths('./testwork/supply_base').sort();
  if (!utility.equalsArray(baseSlpaths, expectBaseSlpathList)) {
    throw new Error(``);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/supply_target').sort();
  if (!utility.equalsArray(targetFpaths, expectBeforeTargetFpathList)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/supply_target').sort();
  if (!utility.equalsArray(targetSlpaths, expectBeforeTargetSlpathList)) {
    throw new Error(``);
  }
  // test extra directory
  const extraDpath = './testwork/supply_dp';
  if (fs.readdirSync(extraDpath).length !== 0) {
    throw new Error(`${extraDpath}`);
  }
};

// test log
// test base directory
// test target directory
// test extra directory
const test_forced_dp = async () => {
  childProcess.execSync(
    `node supply ./testwork/supply_base ./testwork/supply_target -s TEST_FORCED_DP -F -dp ./testwork/supply_dp`
  );

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'supply_TEST_FORCED_DP.json'));
  if (info['Base directory'] !== baseDpath) {
    throw new Error(``);
  }
  if (info['Base file count'] !== expectBaseFpathList.length) {
    throw new Error(``);
  }
  if (info['Base symbolic link count'] !== expectBaseSlpathList.length) {
    throw new Error(``);
  }
  if (info['Target directory'] !== targetDpath) {
    throw new Error(``);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new Error(``);
  }
  if (info['Forced'] !== true) {
    throw new Error(`${info['Forced']}`);
  }
  const extraDpath = path.resolve('./testwork/supply_dp');
  if (info['Extra directory'] !== extraDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordList, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test base directory
  const baseFpaths = utility.getFilePaths('./testwork/supply_base').sort();
  if (!utility.equalsArray(baseFpaths, expectBaseFpathList)) {
    throw new Error(``);
  }
  const baseSlpaths = utility.getSymbolicLinkPaths('./testwork/supply_base').sort();
  if (!utility.equalsArray(baseSlpaths, expectBaseSlpathList)) {
    throw new Error(``);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/supply_target').sort();
  if (!utility.equalsArray(targetFpaths, expectBeforeTargetFpathList)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/supply_target').sort();
  if (!utility.equalsArray(targetSlpaths, expectBeforeTargetSlpathList)) {
    throw new Error(``);
  }
  // test extra directory
  const extraPaths = utility.getFilePaths(extraDpath).
    concat(utility.getSymbolicLinkPaths(extraDpath)).
    map(testPath => utility.omitPath(testPath, extraDpath).replaceAll(path.sep, '/')).
    sort();
  if (!utility.equalsArray(extraPaths, expectRecordList)) {
    throw new Error(``);
  }
};

const main = async () => {
  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceBaseFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceBaseSlpaths);
  fs.emptyDirSync(targetDpath);
  utility.generateResourceFiles(targetDpath, resourceTargetFpaths);
  utility.generateResourceSymbolicLinks(targetDpath, resourceTargetSlpaths);
  fs.emptyDirSync('./testwork/supply_dp');

  await test_not_forced();
  await test_forced();
  await test_not_forced_dp();
  await test_forced_dp();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
