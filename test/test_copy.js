const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

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
  `${process.cwd()}/test/resources/copy/file_bmp`,
  `${process.cwd()}/test/resources/copy/dir1/file_gif1`,
  `${process.cwd()}/test/resources/copy/dir2/file_gif2`,
  `${process.cwd()}/test/resources/copy/dir2/dir1/file_jpg`,
  `${process.cwd()}/test/resources/copy/dir2/dir2/file_png`,
  `${process.cwd()}/test/resources/copy/file_bmp.`,
  `${process.cwd()}/test/resources/copy/dir1/file_gif1.`,
  `${process.cwd()}/test/resources/copy/dir2/file_gif2.`,
  `${process.cwd()}/test/resources/copy/dir2/dir1/file_jpg.`,
  `${process.cwd()}/test/resources/copy/dir2/dir2/file_png.`,
  `${process.cwd()}/test/resources/copy/file_bmp1.bmp`,
  `${process.cwd()}/test/resources/copy/dir1/file_bmp2.BMP`,
  `${process.cwd()}/test/resources/copy/dir2/file_gif1.gif`,
  `${process.cwd()}/test/resources/copy/dir2/dir1/file_gif2.GIF`,
  `${process.cwd()}/test/resources/copy/dir2/dir2/file_jpg1.jpg`,
  `${process.cwd()}/test/resources/copy/file2_jpg2.JPG`,
  `${process.cwd()}/test/resources/copy/dir1/file_png1.png`,
  `${process.cwd()}/test/resources/copy/dir2/file_png2.PNG`
].sort();
const expectBeforeTargetSlpathList = [
  `${process.cwd()}/test/resources/copy/dir2/dir1/syml_bmp`,
  `${process.cwd()}/test/resources/copy/dir2/dir2/syml_gif1`,
  `${process.cwd()}/test/resources/copy/syml_gif2`,
  `${process.cwd()}/test/resources/copy/dir1/syml_jpg`,
  `${process.cwd()}/test/resources/copy/dir2/syml_png`
].sort();

// test log
// test target directory
// test destination directory
const test_not_forced = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy -s TEST_NOT_FORCED`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_NOT_FORCED.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== null) {
    throw new Error(``);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(`${expectRecordList.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordList[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy -s TEST_FORCED -F`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_FORCED.json'));
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
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(``);
  }
  if (info['Filter type'] !== null) {
    throw new Error(``);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(`${expectRecordList.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordList[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(``);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(``);
    }
  }
  // test destination directory
  const destinationFpaths = utility.getFilePaths(destinationDpath);
  if (destinationFpaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  const actualOmittedDestinationFpaths = destinationFpaths.
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  const expectOmittedDestinationFpaths = expectRecordList.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  for (let i = 0; i < actualOmittedDestinationFpaths.length; i++) {
    const actual = actualOmittedDestinationFpaths[i];
    const expect = expectOmittedDestinationFpaths[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_ext_none = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_ext_none -s TEST_NOT_FORCED_EXT_NONE -e ext_none.d -i`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_ext_none');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_NOT_FORCED_EXT_NONE.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'extension:ext_none.d') {
    throw new Error(``);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListExtNone.length) {
    throw new Error(`${expectRecordListExtNone.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListExtNone[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
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
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_ext_none -s TEST_FORCED_EXT_NONE -F -e ext_none.d -i`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_ext_none');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_FORCED_EXT_NONE.json'));
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
  if (info['Filter type'] !== 'extension:ext_none.d') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListExtNone.length) {
    throw new Error(`${expectRecordListExtNone.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListExtNone[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  const destinationFpaths = utility.getFilePaths(destinationDpath);
  if (destinationFpaths.length !== expectRecordListExtNone.length) {
    throw new Error(``);
  }
  const actualOmittedDestinationFpaths = destinationFpaths.
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  const expectOmittedDestinationFpaths = expectRecordListExtNone.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  for (let i = 0; i < actualOmittedDestinationFpaths.length; i++) {
    const actual = actualOmittedDestinationFpaths[i];
    const expect = expectOmittedDestinationFpaths[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_ext_zero = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_ext_zero -s TEST_NOT_FORCED_EXT_ZERO -e ext_zero.d -i`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_ext_zero');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_NOT_FORCED_EXT_ZERO.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'extension:ext_zero.d') {
    throw new Error(``);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListExtZero.length) {
    throw new Error(`${expectRecordListExtZero.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListExtZero[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
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
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_ext_zero -s TEST_FORCED_EXT_ZERO -F -e ext_zero.d -i`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_ext_zero');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_FORCED_EXT_ZERO.json'));
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
  if (info['Filter type'] !== 'extension:ext_zero.d') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListExtZero.length) {
    throw new Error(`${expectRecordListExtZero.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListExtZero[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  const destinationFpaths = utility.getFilePaths(destinationDpath);
  if (destinationFpaths.length !== expectRecordListExtZero.length) {
    throw new Error(``);
  }
  const actualOmittedDestinationFpaths = destinationFpaths.
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  const expectOmittedDestinationFpaths = expectRecordListExtZero.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  for (let i = 0; i < actualOmittedDestinationFpaths.length; i++) {
    const actual = actualOmittedDestinationFpaths[i];
    const expect = expectOmittedDestinationFpaths[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_ext_zero2 = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_ext_zero2 -s TEST_NOT_FORCED_EXT_ZERO2 -e "" -i`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_ext_zero2');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_NOT_FORCED_EXT_ZERO2.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'extension:ext_zero.d') {
    throw new Error(``);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListExtZero.length) {
    throw new Error(`${expectRecordListExtZero.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListExtZero[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced_ext_zero2 = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_ext_zero2 -s TEST_FORCED_EXT_ZERO2 -F -e "" -i`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_ext_zero2');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_FORCED_EXT_ZERO2.json'));
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
  if (info['Filter type'] !== 'extension:ext_zero.d') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListExtZero.length) {
    throw new Error(`${expectRecordListExtZero.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListExtZero[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  const destinationFpaths = utility.getFilePaths(destinationDpath);
  if (destinationFpaths.length !== expectRecordListExtZero.length) {
    throw new Error(``);
  }
  const actualOmittedDestinationFpaths = destinationFpaths.
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  const expectOmittedDestinationFpaths = expectRecordListExtZero.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  for (let i = 0; i < actualOmittedDestinationFpaths.length; i++) {
    const actual = actualOmittedDestinationFpaths[i];
    const expect = expectOmittedDestinationFpaths[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_ext_bmp = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_ext_bmp -s TEST_NOT_FORCED_EXT_BMP -e BMP -i`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_ext_bmp');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_NOT_FORCED_EXT_BMP.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'extension:bmp') {
    throw new Error(``);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListExtBmp.length) {
    throw new Error(`${expectRecordListExtBmp.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListExtBmp[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
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
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_ext_bmp -s TEST_FORCED_EXT_BMP -F -e BMP -i`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_ext_bmp');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_FORCED_EXT_BMP.json'));
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
  if (info['Filter type'] !== 'extension:bmp') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListExtBmp.length) {
    throw new Error(`${expectRecordListExtBmp.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListExtBmp[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  const destinationFpaths = utility.getFilePaths(destinationDpath);
  if (destinationFpaths.length !== expectRecordListExtBmp.length) {
    throw new Error(``);
  }
  const actualOmittedDestinationFpaths = destinationFpaths.
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  const expectOmittedDestinationFpaths = expectRecordListExtBmp.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  for (let i = 0; i < actualOmittedDestinationFpaths.length; i++) {
    const actual = actualOmittedDestinationFpaths[i];
    const expect = expectOmittedDestinationFpaths[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_img_bmp = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_img_bmp -s TEST_NOT_FORCED_IMG_BMP -e -i bmp`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_img_bmp');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_NOT_FORCED_IMG_BMP.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'image:bmp') {
    throw new Error(`${info['Filter type']} !== 'image:bmp`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListImgBmp.length) {
    throw new Error(`${expectRecordListImgBmp.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListImgBmp[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
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
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_img_bmp -s TEST_FORCED_IMG_BMP -F -e -i bmp`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_img_bmp');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_FORCED_IMG_BMP.json'));
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
  if (info['Filter type'] !== 'image:bmp') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListImgBmp.length) {
    throw new Error(`${expectRecordListImgBmp.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListImgBmp[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  const destinationFpaths = utility.getFilePaths(destinationDpath);
  if (destinationFpaths.length !== expectRecordListImgBmp.length) {
    throw new Error(``);
  }
  const actualOmittedDestinationFpaths = destinationFpaths.
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  const expectOmittedDestinationFpaths = expectRecordListImgBmp.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  for (let i = 0; i < actualOmittedDestinationFpaths.length; i++) {
    const actual = actualOmittedDestinationFpaths[i];
    const expect = expectOmittedDestinationFpaths[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_img_gif = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_img_gif -s TEST_NOT_FORCED_IMG_GIF -e -i gif`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_img_gif');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_NOT_FORCED_IMG_GIF.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'image:gif') {
    throw new Error(`${info['Filter type']} !== 'image:gif`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListImgGif.length) {
    throw new Error(`${expectRecordListImgGif.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListImgGif[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
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
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_img_gif -s TEST_FORCED_IMG_GIF -F -e -i GIF`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_img_gif');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_FORCED_IMG_GIF.json'));
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
  if (info['Filter type'] !== 'image:gif') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListImgGif.length) {
    throw new Error(`${expectRecordListImgGif.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListImgGif[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  const destinationFpaths = utility.getFilePaths(destinationDpath);
  if (destinationFpaths.length !== expectRecordListImgGif.length) {
    throw new Error(``);
  }
  const actualOmittedDestinationFpaths = destinationFpaths.
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  const expectOmittedDestinationFpaths = expectRecordListImgGif.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  for (let i = 0; i < actualOmittedDestinationFpaths.length; i++) {
    const actual = actualOmittedDestinationFpaths[i];
    const expect = expectOmittedDestinationFpaths[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_img_jpg = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_img_jpg -s TEST_NOT_FORCED_IMG_JPG -e -i JPG`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_img_jpg');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_NOT_FORCED_IMG_JPG.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'image:jpg') {
    throw new Error(`${info['Filter type']} !== 'image:jpg`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListImgJpg.length) {
    throw new Error(`${expectRecordListImgJpg.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListImgJpg[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
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
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_img_jpg -s TEST_FORCED_IMG_JPG -F -e -i jpg`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_img_jpg');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_FORCED_IMG_JPG.json'));
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
  if (info['Filter type'] !== 'image:jpg') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListImgJpg.length) {
    throw new Error(`${expectRecordListImgJpg.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListImgJpg[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  const destinationFpaths = utility.getFilePaths(destinationDpath);
  if (destinationFpaths.length !== expectRecordListImgJpg.length) {
    throw new Error(``);
  }
  const actualOmittedDestinationFpaths = destinationFpaths.
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  const expectOmittedDestinationFpaths = expectRecordListImgJpg.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  for (let i = 0; i < actualOmittedDestinationFpaths.length; i++) {
    const actual = actualOmittedDestinationFpaths[i];
    const expect = expectOmittedDestinationFpaths[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_img_png = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_img_png -s TEST_NOT_FORCED_IMG_PNG -e -i PNG`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_img_png');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_NOT_FORCED_IMG_PNG.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== 'image:png') {
    throw new Error(`${info['Filter type']} !== 'image:png`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListImgPng.length) {
    throw new Error(`${expectRecordListImgPng.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListImgPng[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
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
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_img_png -s TEST_FORCED_IMG_PNG -F -e -i png`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_img_png');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_FORCED_IMG_PNG.json'));
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
  if (info['Filter type'] !== 'image:png') {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordListImgPng.length) {
    throw new Error(`${expectRecordListImgPng.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordListImgPng[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  const destinationFpaths = utility.getFilePaths(destinationDpath);
  if (destinationFpaths.length !== expectRecordListImgPng.length) {
    throw new Error(``);
  }
  const actualOmittedDestinationFpaths = destinationFpaths.
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  const expectOmittedDestinationFpaths = expectRecordListImgPng.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  for (let i = 0; i < actualOmittedDestinationFpaths.length; i++) {
    const actual = actualOmittedDestinationFpaths[i];
    const expect = expectOmittedDestinationFpaths[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
};

// test log
// test target directory
// test destination directory
const test_not_forced_img_other = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_img_other -s TEST_NOT_FORCED_IMG_OTHER -e -i OTHER`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_img_other');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_NOT_FORCED_IMG_OTHER.json'));
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
  if (info['Destination directory'] !== null) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  if (info['Filter type'] !== null) {
    throw new Error(`${info['Filter type']} !== null`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(`${expectRecordList.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordList[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  if (fs.readdirSync(destinationDpath).length !== 0) {
    throw new Error(``);
  }
};

// test log
// test target directory
// test destination directory
const test_forced_img_other = async () => {
  childProcess.execSync(`node copy ./test/resources/copy ./testwork/copy_img_other -s TEST_FORCED_IMG_OTHER -F -e -i other`);
  const targetDpath = path.resolve('./test/resources/copy');
  const destinationDpath = path.resolve('./testwork/copy_img_other');

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'copy_TEST_FORCED_IMG_OTHER.json'));
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
  if (info['Filter type'] !== null) {
    throw new Error(``);
  }
  if (info['Destination directory'] !== destinationDpath) {
    throw new Error(`Destination directory: ${info['Destination directory']}`);
  }
  info['Records'].sort();
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(`${expectRecordList.length} !== ${info['Records'].length}`);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (info['Records'][i] !== expectRecordList[i]) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths(targetDpath).sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(`${targetFpaths[i]}`);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath).sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(`${targetSlpaths.length}`);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(`${targetSlpaths[i]}`);
    }
  }
  // test destination directory
  const destinationFpaths = utility.getFilePaths(destinationDpath);
  if (destinationFpaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  const actualOmittedDestinationFpaths = destinationFpaths.
    map(fpath => utility.omitPath(fpath, destinationDpath)).
    sort();
  const expectOmittedDestinationFpaths = expectRecordList.
    map(record => recordRegExp.exec(record).groups.newPath).
    sort();
  for (let i = 0; i < actualOmittedDestinationFpaths.length; i++) {
    const actual = actualOmittedDestinationFpaths[i];
    const expect = expectOmittedDestinationFpaths[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
};

const main = async () => {
  fs.emptyDirSync('./testwork/copy');
  await test_not_forced();
  await test_forced();

  fs.emptyDirSync('./testwork/copy_ext_none');
  await test_not_forced_ext_none();
  await test_forced_ext_none();

  fs.emptyDirSync('./testwork/copy_ext_zero');
  await test_not_forced_ext_zero();
  await test_forced_ext_zero();

  fs.emptyDirSync('./testwork/copy_ext_zero2');
  await test_not_forced_ext_zero2();
  await test_forced_ext_zero2();

  fs.emptyDirSync('./testwork/copy_ext_bmp');
  await test_not_forced_ext_bmp();
  await test_forced_ext_bmp();

  fs.emptyDirSync('./testwork/copy_img_bmp');
  await test_not_forced_img_bmp();
  await test_forced_img_bmp();

  fs.emptyDirSync('./testwork/copy_img_gif');
  await test_not_forced_img_gif();
  await test_forced_img_gif();

  fs.emptyDirSync('./testwork/copy_img_jpg');
  await test_not_forced_img_jpg();
  await test_forced_img_jpg();

  fs.emptyDirSync('./testwork/copy_img_png');
  await test_not_forced_img_png();
  await test_forced_img_png();

  fs.emptyDirSync('./testwork/copy_img_other');
  await test_not_forced_img_other();
  await test_forced_img_other();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
