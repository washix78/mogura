const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const baseDpath = path.resolve(process.cwd(), 'testwork/move');

const resourceFpaths = [
  'file_bmp:file_bmp',
  'file_bmp:file_bmp.',
  'file_bmp:file_bmp1.bmp',
  'file_bmp:dir1/file_bmp2.BMP',
  'file_gif1:dir1/file_gif1',
  'file_gif1:dir1/file_gif1.',
  'file_gif1:dir2/file_gif1.gif',
  'file_gif2:dir2/file_gif2',
  'file_gif2:dir2/file_gif2.',
  'file_gif2:dir2/dir1/file_gif2.GIF',
  'file_jpg:dir2/dir1/file_jpg',
  'file_jpg:dir2/dir1/file_jpg.',
  'file_jpg:dir2/dir2/file_jpg1.jpg',
  'file_jpg:file2_jpg2.JPG',
  'file_png:dir2/dir2/file_png',
  'file_png:dir2/dir2/file_png.',
  'file_png:dir1/file_png1.png',
  'file_png:dir2/file_png2.PNG'
];
const resourceSlpaths = [
  'file_bmp:dir2/dir1/syml_bmp',
  'file_gif1:dir2/dir2/syml_gif1',
  'file_gif2:syml_gif2',
  'file_jpg:dir1/syml_jpg',
  'file_png:dir2/syml_png'
];

const recordRegExp = /^(?<newPath>.+)\:(?<oldPath>.+)/;
const expectRecordList = [
  'file_bmp:file_bmp',
  'dir1/file_gif1:dir1/file_gif1',
  'dir2/file_gif2:dir2/file_gif2',
  'dir2/dir1/file_jpg:dir2/dir1/file_jpg',
  'dir2/dir2/file_png:dir2/dir2/file_png',
  'file_bmp.:file_bmp.',
  'dir1/file_gif1.:dir1/file_gif1.',
  'dir2/file_gif2.:dir2/file_gif2.',
  'dir2/dir1/file_jpg.:dir2/dir1/file_jpg.',
  'dir2/dir2/file_png.:dir2/dir2/file_png.',
  'file_bmp1.bmp:file_bmp1.bmp',
  'dir1/file_bmp2.BMP:dir1/file_bmp2.BMP',
  'dir2/file_gif1.gif:dir2/file_gif1.gif',
  'dir2/dir1/file_gif2.GIF:dir2/dir1/file_gif2.GIF',
  'dir2/dir2/file_jpg1.jpg:dir2/dir2/file_jpg1.jpg',
  'file2_jpg2.JPG:file2_jpg2.JPG',
  'dir1/file_png1.png:dir1/file_png1.png',
  'dir2/file_png2.PNG:dir2/file_png2.PNG'
].sort();
const expectRecordListExtNone = [
  'file_bmp:file_bmp',
  'dir1/file_gif1:dir1/file_gif1',
  'dir2/file_gif2:dir2/file_gif2',
  'dir2/dir1/file_jpg:dir2/dir1/file_jpg',
  'dir2/dir2/file_png:dir2/dir2/file_png'
].sort();
const expectRecordListExtZero = [
  'file_bmp.:file_bmp.',
  'dir1/file_gif1.:dir1/file_gif1.',
  'dir2/file_gif2.:dir2/file_gif2.',
  'dir2/dir1/file_jpg.:dir2/dir1/file_jpg.',
  'dir2/dir2/file_png.:dir2/dir2/file_png.'
].sort();
const expectRecordListExtBmp = [
  'file_bmp1.bmp:file_bmp1.bmp',
  'dir1/file_bmp2.BMP:dir1/file_bmp2.BMP'
].sort();
const expectRecordListImgBmp = [
  'file_bmp:file_bmp',
  'file_bmp.:file_bmp.',
  'file_bmp1.bmp:file_bmp1.bmp',
  'dir1/file_bmp2.BMP:dir1/file_bmp2.BMP'
].sort();
const expectRecordListImgGif = [
  'dir1/file_gif1:dir1/file_gif1',
  'dir2/file_gif2:dir2/file_gif2',
  'dir1/file_gif1.:dir1/file_gif1.',
  'dir2/file_gif2.:dir2/file_gif2.',
  'dir2/file_gif1.gif:dir2/file_gif1.gif',
  'dir2/dir1/file_gif2.GIF:dir2/dir1/file_gif2.GIF'
].sort();
const expectRecordListImgJpg = [
  'dir2/dir1/file_jpg:dir2/dir1/file_jpg',
  'dir2/dir1/file_jpg.:dir2/dir1/file_jpg.',
  'dir2/dir2/file_jpg1.jpg:dir2/dir2/file_jpg1.jpg',
  'file2_jpg2.JPG:file2_jpg2.JPG'
].sort();
const expectRecordListImgPng = [
  'dir2/dir2/file_png:dir2/dir2/file_png',
  'dir2/dir2/file_png.:dir2/dir2/file_png.',
  'dir1/file_png1.png:dir1/file_png1.png',
  'dir2/file_png2.PNG:dir2/file_png2.PNG'
].sort();

const expectBeforeTargetFpathList = [
  'file_bmp',
  'dir1/file_gif1',
  'dir2/file_gif2',
  'dir2/dir1/file_jpg',
  'dir2/dir2/file_png',
  'file_bmp.',
  'dir1/file_gif1.',
  'dir2/file_gif2.',
  'dir2/dir1/file_jpg.',
  'dir2/dir2/file_png.',
  'file_bmp1.bmp',
  'dir1/file_bmp2.BMP',
  'dir2/file_gif1.gif',
  'dir2/dir1/file_gif2.GIF',
  'dir2/dir2/file_jpg1.jpg',
  'file2_jpg2.JPG',
  'dir1/file_png1.png',
  'dir2/file_png2.PNG'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectBeforeTargetSlpathList = [
  'dir2/dir1/syml_bmp',
  'dir2/dir2/syml_gif1',
  'syml_gif2',
  'dir1/syml_jpg',
  'dir2/syml_png'
].map(testPath => path.resolve(baseDpath, testPath)).sort();

const expectAfterTargetFpathList = [
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectAfterTargetFpathListExtNone = [
  'file_bmp.',
  'dir1/file_gif1.',
  'dir2/file_gif2.',
  'dir2/dir1/file_jpg.',
  'dir2/dir2/file_png.',
  'file_bmp1.bmp',
  'dir1/file_bmp2.BMP',
  'dir2/file_gif1.gif',
  'dir2/dir1/file_gif2.GIF',
  'dir2/dir2/file_jpg1.jpg',
  'file2_jpg2.JPG',
  'dir1/file_png1.png',
  'dir2/file_png2.PNG'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectAfterTargetFpathListExtZero = [
  'file_bmp',
  'dir1/file_gif1',
  'dir2/file_gif2',
  'dir2/dir1/file_jpg',
  'dir2/dir2/file_png',
  'file_bmp1.bmp',
  'dir1/file_bmp2.BMP',
  'dir2/file_gif1.gif',
  'dir2/dir1/file_gif2.GIF',
  'dir2/dir2/file_jpg1.jpg',
  'file2_jpg2.JPG',
  'dir1/file_png1.png',
  'dir2/file_png2.PNG'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectAfterTargetFpathListExtBmp = [
  'file_bmp',
  'dir1/file_gif1',
  'dir2/file_gif2',
  'dir2/dir1/file_jpg',
  'dir2/dir2/file_png',
  'file_bmp.',
  'dir1/file_gif1.',
  'dir2/file_gif2.',
  'dir2/dir1/file_jpg.',
  'dir2/dir2/file_png.',
  'dir2/file_gif1.gif',
  'dir2/dir1/file_gif2.GIF',
  'dir2/dir2/file_jpg1.jpg',
  'file2_jpg2.JPG',
  'dir1/file_png1.png',
  'dir2/file_png2.PNG'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectAfterTargetFpathListImgBmp = [
  'dir1/file_gif1',
  'dir2/file_gif2',
  'dir2/dir1/file_jpg',
  'dir2/dir2/file_png',
  'dir1/file_gif1.',
  'dir2/file_gif2.',
  'dir2/dir1/file_jpg.',
  'dir2/dir2/file_png.',
  'dir2/file_gif1.gif',
  'dir2/dir1/file_gif2.GIF',
  'dir2/dir2/file_jpg1.jpg',
  'file2_jpg2.JPG',
  'dir1/file_png1.png',
  'dir2/file_png2.PNG'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectAfterTargetFpathListImgGif = [
  'file_bmp',
  'dir2/dir1/file_jpg',
  'dir2/dir2/file_png',
  'file_bmp.',
  'dir2/dir1/file_jpg.',
  'dir2/dir2/file_png.',
  'file_bmp1.bmp',
  'dir1/file_bmp2.BMP',
  'dir2/dir2/file_jpg1.jpg',
  'file2_jpg2.JPG',
  'dir1/file_png1.png',
  'dir2/file_png2.PNG'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectAfterTargetFpathListImgJpg = [
  'file_bmp',
  'dir1/file_gif1',
  'dir2/file_gif2',
  'dir2/dir2/file_png',
  'file_bmp.',
  'dir1/file_gif1.',
  'dir2/file_gif2.',
  'dir2/dir2/file_png.',
  'file_bmp1.bmp',
  'dir1/file_bmp2.BMP',
  'dir2/file_gif1.gif',
  'dir2/dir1/file_gif2.GIF',
  'dir1/file_png1.png',
  'dir2/file_png2.PNG'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectAfterTargetFpathListImgPng = [
  'file_bmp',
  'dir1/file_gif1',
  'dir2/file_gif2',
  'dir2/dir1/file_jpg',
  'file_bmp.',
  'dir1/file_gif1.',
  'dir2/file_gif2.',
  'dir2/dir1/file_jpg.',
  'file_bmp1.bmp',
  'dir1/file_bmp2.BMP',
  'dir2/file_gif1.gif',
  'dir2/dir1/file_gif2.GIF',
  'dir2/dir2/file_jpg1.jpg',
  'file2_jpg2.JPG'
].map(testPath => path.resolve(baseDpath, testPath)).sort();

const test_error = async () => {
  const errorProcess = (cmd) => {
    return new Promise((resolve, reject) => {
      childProcess.exec(cmd, (_err, _stdout, stderr) => {
        if (stderr === undefined || stderr === null || stderr.length === 0) {
          reject(new Error(`${cmd}`));
        } else {
          resolve();
        }
      });
    });
  };

  await errorProcess(`node move ./testwork/move ./testwork/move_error -s TEST_ERROR_EXT -F -e`);
  // target directory
  const errorExtFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, errorExtFpaths)) {
    throw new Error(``);
  }
  const errorExtSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, errorExtSlpaths)) {
    throw new Error(``);
  }
  // destination directory
  if (fs.readdirSync('./testwork/move_error').length !== 0) {
    throw new Error(``);
  }

  await errorProcess(`node move ./testwork/move ./testwork/move_error -s TEST_ERROR_IMG -F -i`);
  // target directory
  const errorImgFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, errorImgFpaths)) {
    throw new Error(``);
  }
  const errorImgSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, errorImgSlpaths)) {
    throw new Error(``);
  }
  // destination directory
  if (fs.readdirSync('./testwork/move_error').length !== 0) {
    throw new Error(``);
  }

  await errorProcess(`node move ./testwork/move ./testwork/move_error -s TEST_ERROR_IMG_XML -F -i xml`);
  // target directory
  const errorImgXmlFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, errorImgXmlFpaths)) {
    throw new Error(``);
  }
  const errorImgXmlSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, errorImgXmlSlpaths)) {
    throw new Error(``);
  }
  // destination directory
  if (fs.readdirSync('./testwork/move_error').length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_all = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_all -s TEST_NOT_FORCED_ALL`);
  const destinationDpath = path.resolve('./testwork/move_all');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_NOT_FORCED_ALL.json'));
  if (info['Target directory'] !== baseDpath) {
    throw new Error(`Target directory: ${info['Target directory']}`);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(`Target file count: ${info['Target file count']}`);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new error(`${info['Symbolic link count']}`);
  }
  if (info['Forced'] !== false) {
    throw new Error(`Forced: ${info['Forced']}`);
  }
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== null) {
    throw new Error(``);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordList, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced_all = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_all -s TEST_FORCED_ALL -F`);
  const destinationDpath = path.resolve('./testwork/move_all');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_FORCED_ALL.json'));
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
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(``);
  }
  if (info['Filter type'] !== null) {
    throw new Error(``);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordList, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectAfterTargetFpathList, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  const expectOmittedDestinationFpaths = expectRecordList.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  const actualOmittedDestinationFpaths = utility.getFilePaths(destinationDpath).
    map(fpath => utility.omitPath(fpath, destinationDpath).replaceAll(path.sep, '/')).
    sort();
  if (!utility.equalsArray(expectOmittedDestinationFpaths, actualOmittedDestinationFpaths)) {
    throw new Error(``);
  }
  if (utility.getSymbolicLinkPaths(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_ext_none = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_ext_none -s TEST_NOT_FORCED_EXT_NONE -e ext_none.d`);
  const destinationDpath = path.resolve('./testwork/move_ext_none');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_NOT_FORCED_EXT_NONE.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'extension:ext_none.d') {
    throw new Error(``);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListExtNone, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced_ext_none = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_ext_none -s TEST_FORCED_EXT_NONE -F -e ext_none.d`);
  const destinationDpath = path.resolve('./testwork/move_ext_none');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_FORCED_EXT_NONE.json'));
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
  if (info['Filter type'] !== 'extension:ext_none.d') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListExtNone, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectAfterTargetFpathListExtNone, targetFpaths)) {
    console.log(expectAfterTargetFpathListExtNone);
    console.log(targetFpaths);
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  const expectOmittedDestinationFpaths = expectRecordListExtNone.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  const actualOmittedDestinationFpaths = utility.getFilePaths(destinationDpath).
    map(fpath => utility.omitPath(fpath, destinationDpath).replaceAll(path.sep, '/')).
    sort();
  if (!utility.equalsArray(expectOmittedDestinationFpaths, actualOmittedDestinationFpaths)) {
    throw new Error(``);
  }
  if (utility.getSymbolicLinkPaths(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_ext_zero = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_ext_zero -s TEST_NOT_FORCED_EXT_ZERO -e ext_zero.d`);
  const destinationDpath = path.resolve('./testwork/move_ext_zero');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_NOT_FORCED_EXT_ZERO.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'extension:ext_zero.d') {
    throw new Error(``);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListExtZero, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced_ext_zero = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_ext_zero -s TEST_FORCED_EXT_ZERO -F -e ext_zero.d`);
  const destinationDpath = path.resolve('./testwork/move_ext_zero');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_FORCED_EXT_ZERO.json'));
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
  if (info['Filter type'] !== 'extension:ext_zero.d') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListExtZero, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectAfterTargetFpathListExtZero, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  const expectOmittedDestinationFpaths = expectRecordListExtZero.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  const actualOmittedDestinationFpaths = utility.getFilePaths(destinationDpath).
    map(fpath => utility.omitPath(fpath, destinationDpath).replaceAll(path.sep, '/')).
    sort();
  if (!utility.equalsArray(expectOmittedDestinationFpaths, actualOmittedDestinationFpaths)) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_ext_zero_length = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_ext_zero_length -s TEST_NOT_FORCED_EXT_ZERO_LENGTH -e ""`);
  const destinationDpath = path.resolve('./testwork/move_ext_zero_length');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_NOT_FORCED_EXT_ZERO_LENGTH.json'));
  if (info['Target directory'] !== baseDpath) {
    throw new Error(`Target directory: ${info['Target directory']}`);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(`Target file count: ${info['Target file count']}`);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new error(`${info['Symbolic link count']}`);
  }
  if (info['Forced'] !== false) {
    throw new Error(`Forced: ${info['Forced']}`);
  }
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'extension:ext_zero.d') {
    throw new Error(``);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListExtZero, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced_ext_zero_length = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_ext_zero_length -s TEST_FORCED_EXT_ZERO_LENGTH -F -e ""`);
  const destinationDpath = path.resolve('./testwork/move_ext_zero_length');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_FORCED_EXT_ZERO_LENGTH.json'));
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
  if (info['Filter type'] !== 'extension:ext_zero.d') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListExtZero, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectAfterTargetFpathListExtZero, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  const expectOmittedDestinationFpaths = expectRecordListExtZero.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  const actualOmittedDestinationFpaths = utility.getFilePaths(destinationDpath).
    map(fpath => utility.omitPath(fpath, destinationDpath).replaceAll(path.sep, '/')).
    sort();
  if (!utility.equalsArray(expectOmittedDestinationFpaths, actualOmittedDestinationFpaths)) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_ext_bmp = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_ext_bmp -s TEST_NOT_FORCED_EXT_BMP -e BMP`);
  const destinationDpath = path.resolve('./testwork/move_ext_bmp');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_NOT_FORCED_EXT_BMP.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'extension:bmp') {
    throw new Error(``);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListExtBmp, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced_ext_bmp = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_ext_bmp -s TEST_FORCED_EXT_BMP -F -e BMP`);
  const destinationDpath = path.resolve('./testwork/move_ext_bmp');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_FORCED_EXT_BMP.json'));
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
  if (info['Filter type'] !== 'extension:bmp') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListExtBmp, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectAfterTargetFpathListExtBmp, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  const expectOmittedDestinationFpaths = expectRecordListExtBmp.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  const actualOmittedDestinationFpaths = utility.getFilePaths(destinationDpath).
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  if (!utility.equalsArray(expectOmittedDestinationFpaths, actualOmittedDestinationFpaths)) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_img_bmp = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_img_bmp -s TEST_NOT_FORCED_IMG_BMP -i bmp`);
  const destinationDpath = path.resolve('./testwork/move_img_bmp');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_NOT_FORCED_IMG_BMP.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'image:bmp') {
    throw new Error(`${info['Filter type']} !== 'image:bmp`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListImgBmp, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced_img_bmp = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_img_bmp -s TEST_FORCED_IMG_BMP -F -i bmp`);
  const destinationDpath = path.resolve('./testwork/move_img_bmp');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_FORCED_IMG_BMP.json'));
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
  if (info['Filter type'] !== 'image:bmp') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListImgBmp, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectAfterTargetFpathListImgBmp, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  const expectOmittedDestinationFpaths = expectRecordListImgBmp.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  const actualOmittedDestinationFpaths = utility.getFilePaths(destinationDpath).
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  if (!utility.equalsArray(expectOmittedDestinationFpaths, actualOmittedDestinationFpaths)) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_img_gif = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_img_gif -s TEST_NOT_FORCED_IMG_GIF -i gif`);
  const destinationDpath = path.resolve('./testwork/move_img_gif');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_NOT_FORCED_IMG_GIF.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'image:gif') {
    throw new Error(`${info['Filter type']} !== 'image:gif`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListImgGif, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced_img_gif = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_img_gif -s TEST_FORCED_IMG_GIF -F -i GIF`);
  const destinationDpath = path.resolve('./testwork/move_img_gif');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_FORCED_IMG_GIF.json'));
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
  if (info['Filter type'] !== 'image:gif') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListImgGif, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectAfterTargetFpathListImgGif, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  const expectOmittedDestinationFpaths = expectRecordListImgGif.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  const actualOmittedDestinationFpaths = utility.getFilePaths(destinationDpath).
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  if (!utility.equalsArray(expectOmittedDestinationFpaths, actualOmittedDestinationFpaths)) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_img_jpg = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_img_jpg -s TEST_NOT_FORCED_IMG_JPG -i JPG`);
  const destinationDpath = path.resolve('./testwork/move_img_jpg');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_NOT_FORCED_IMG_JPG.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'image:jpg') {
    throw new Error(`${info['Filter type']} !== 'image:jpg`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListImgJpg, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced_img_jpg = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_img_jpg -s TEST_FORCED_IMG_JPG -F -i jpg`);
  const destinationDpath = path.resolve('./testwork/move_img_jpg');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_FORCED_IMG_JPG.json'));
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
  if (info['Filter type'] !== 'image:jpg') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListImgJpg, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectAfterTargetFpathListImgJpg, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  const expectOmittedDestinationFpaths = expectRecordListImgJpg.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  const actualOmittedDestinationFpaths = utility.getFilePaths(destinationDpath).
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  if (!utility.equalsArray(expectOmittedDestinationFpaths, actualOmittedDestinationFpaths)) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_img_png = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_img_png -s TEST_NOT_FORCED_IMG_PNG -i PNG`);
  const destinationDpath = path.resolve('./testwork/move_img_png');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_NOT_FORCED_IMG_PNG.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'image:png') {
    throw new Error(`${info['Filter type']} !== 'image:png`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListImgPng, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetFpathList, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced_img_png = async () => {
  childProcess.execSync(`node move ./testwork/move ./testwork/move_img_png -s TEST_FORCED_IMG_PNG -F -i png`);
  const destinationDpath = path.resolve('./testwork/move_img_png');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'move_TEST_FORCED_IMG_PNG.json'));
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
  if (info['Filter type'] !== 'image:png') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/')).sort();
  if (!utility.equalsArray(expectRecordListImgPng, records)) {
    throw new Error(``);
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(baseDpath).sort();
  if (!utility.equalsArray(expectAfterTargetFpathListImgPng, targetFpaths)) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(baseDpath).sort();
  if (!utility.equalsArray(expectBeforeTargetSlpathList, targetSlpaths)) {
    throw new Error(``);
  }
  // test destination directory
  const expectOmittedDestinationFpaths = expectRecordListImgPng.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();

  const actualOmittedDestinationFpaths = utility.getFilePaths(destinationDpath).
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  if (!utility.equalsArray(expectOmittedDestinationFpaths, actualOmittedDestinationFpaths)) {
    throw new Error(``);
  }
};

const main = async () => {
  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);
  fs.emptyDirSync('./testwork/move_error');
  await test_error();

  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);
  fs.emptyDirSync('./testwork/move_all');
  await test_not_forced_all();
  await test_forced_all();

  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);
  fs.emptyDirSync('./testwork/move_ext_none');
  await test_not_forced_ext_none();
  await test_forced_ext_none();

  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);
  fs.emptyDirSync('./testwork/move_ext_zero');
  await test_not_forced_ext_zero();
  await test_forced_ext_zero();

  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);
  fs.emptyDirSync('./testwork/move_ext_zero_length');
  await test_not_forced_ext_zero_length();
  await test_forced_ext_zero_length();

  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);
  fs.emptyDirSync('./testwork/move_ext_bmp');
  await test_not_forced_ext_bmp();
  await test_forced_ext_bmp();

  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);
  fs.emptyDirSync('./testwork/move_img_bmp');
  await test_not_forced_img_bmp();
  await test_forced_img_bmp();

  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);
  fs.emptyDirSync('./testwork/move_img_gif');
  await test_not_forced_img_gif();
  await test_forced_img_gif();

  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);
  fs.emptyDirSync('./testwork/move_img_jpg');
  await test_not_forced_img_jpg();
  await test_forced_img_jpg();

  fs.emptyDirSync(baseDpath);
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);
  fs.emptyDirSync('./testwork/move_img_png');
  await test_not_forced_img_png();
  await test_forced_img_png();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
