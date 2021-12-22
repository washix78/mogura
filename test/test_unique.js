const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const baseDpath = path.resolve(process.cwd(), 'testwork/unique');

const resourceFpaths = [
  'file0:file0',
  'file1:dir1/file1',
  'file1:dir2/file1',
  'file2:99_76543210987654321-00_12345678901234567-file2',
  'file2:dir2/dir1/file2_1',
  'file2:dir2/dir1/file2_2',
  'file2:dir2/dir2/99_76543210987654321-file2',
  'file3:dir1/file3_0',
  'file3:dir2/file3_1',
  'file3:dir2/dir1/file3_2',
  'file3:dir2/dir2/file3_3',
  'file3:file3_4',
  'file3:dir1/file3_5',
  'file3:dir2/file3_6',
  'file3:dir2/dir1/file3_7',
  'file3:dir2/dir2/file3_8',
  'file3:file3_9',
  'file4:dir1/file4_00',
  'file4:dir2/file4_01',
  'file4:dir2/dir1/file4_02',
  'file4:dir2/dir2/file4_03',
  'file4:file4_04',
  'file4:dir1/file4_05',
  'file4:dir2/file4_06',
  'file4:dir2/dir1/file4_07',
  'file4:dir2/dir2/file4_08',
  'file4:file4_09',
  'file4:dir1/file4_10'
];
const resourceSlpaths = [
  'file5:dir2/syml5',
  'file6:dir2/dir1/syml6',
  'file7:dir2/dir2/syml7',
  'file8:syml8',
  'file9:dir1/syml9'
];

const expectRecordList = [
  '7c12772809c1c0c3deda6103b10fdfa0_12039d6dd9a7e27622301e935b6eefc78846802e/0_12345678901234567-file1:dir1/file1',
  '7c12772809c1c0c3deda6103b10fdfa0_12039d6dd9a7e27622301e935b6eefc78846802e/1_12345678901234567-file1:dir2/file1',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/0_12345678901234567-file2_1:dir2/dir1/file2_1',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/1_12345678901234567-file2_2:dir2/dir1/file2_2',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/2_12345678901234567-file2:dir2/dir2/99_76543210987654321-file2',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/3_12345678901234567-00_12345678901234567-file2:99_76543210987654321-00_12345678901234567-file2',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/0_12345678901234567-file3_0:dir1/file3_0',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/1_12345678901234567-file3_1:dir2/file3_1',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/2_12345678901234567-file3_2:dir2/dir1/file3_2',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/3_12345678901234567-file3_3:dir2/dir2/file3_3',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/4_12345678901234567-file3_4:file3_4',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/5_12345678901234567-file3_5:dir1/file3_5',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/6_12345678901234567-file3_6:dir2/file3_6',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/7_12345678901234567-file3_7:dir2/dir1/file3_7',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/8_12345678901234567-file3_8:dir2/dir2/file3_8',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/9_12345678901234567-file3_9:file3_9',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/00_12345678901234567-file4_00:dir1/file4_00',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/01_12345678901234567-file4_01:dir2/file4_01',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/02_12345678901234567-file4_02:dir2/dir1/file4_02',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/03_12345678901234567-file4_03:dir2/dir2/file4_03',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/04_12345678901234567-file4_04:file4_04',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/05_12345678901234567-file4_05:dir1/file4_05',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/06_12345678901234567-file4_06:dir2/file4_06',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/07_12345678901234567-file4_07:dir2/dir1/file4_07',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/08_12345678901234567-file4_08:dir2/dir2/file4_08',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/09_12345678901234567-file4_09:file4_09',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/10_12345678901234567-file4_10:dir1/file4_10',
  'syml.d/0_12345678901234567-syml5:dir2/syml5',
  'syml.d/1_12345678901234567-syml6:dir2/dir1/syml6',
  'syml.d/2_12345678901234567-syml7:dir2/dir2/syml7',
  'syml.d/3_12345678901234567-syml8:syml8',
  'syml.d/4_12345678901234567-syml9:dir1/syml9'
];
const recordRegExp = /^(?<digest>syml\.d|[0-9a-z]{32}_[0-9a-z]{40})\/(?<no>\d+)_\d{17}\-(?<newName>.+)\:(?<oldPath>.+)$/;
const expectBeforeTargetFpathList = [
  'file0',
  'dir1/file1',
  'dir2/file1',
  'dir2/dir1/file2_1',
  'dir2/dir1/file2_2',
  'dir2/dir2/99_76543210987654321-file2',
  '99_76543210987654321-00_12345678901234567-file2',
  'dir1/file3_0',
  'dir2/file3_1',
  'dir2/dir1/file3_2',
  'dir2/dir2/file3_3',
  'file3_4',
  'dir1/file3_5',
  'dir2/file3_6',
  'dir2/dir1/file3_7',
  'dir2/dir2/file3_8',
  'file3_9',
  'dir1/file4_00',
  'dir2/file4_01',
  'dir2/dir1/file4_02',
  'dir2/dir2/file4_03',
  'file4_04',
  'dir1/file4_05',
  'dir2/file4_06',
  'dir2/dir1/file4_07',
  'dir2/dir2/file4_08',
  'file4_09',
  'dir1/file4_10'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectBeforeTargetSLpathList = [
  'dir2/syml5',
  'dir2/dir1/syml6',
  'dir2/dir2/syml7',
  'syml8',
  'dir1/syml9'
].map(testPath => path.resolve(baseDpath, testPath)).sort();

/*
 * test log
 * test target directory
 * test extra directory
 */
const test_not_forced = async () => {
  childProcess.execSync(`node unique ./testwork/unique -s TEST_NOT_FORCED`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'unique_TEST_NOT_FORCED.json'));
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
  const actualRecord_digest_no = records.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.no}`;
  }).sort();
  const expectRecord_digest_no = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_digest_no.length; i++) {
    const actual = actualRecord_digest_no[i];
    const expect = expectRecord_digest_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualRecord_digest_newName_oldPath = records.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_digest_newName_oldPath = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  if (actualRecord_digest_newName_oldPath.length !== expectRecord_digest_newName_oldPath.length) {
    throw new Error(``);
  }
  for (let i = 0; i < actualRecord_digest_newName_oldPath.length; i++) {
    const actual = actualRecord_digest_newName_oldPath[i];
    const expect = expectRecord_digest_newName_oldPath[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }

  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/unique').sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(``);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/unique').sort();
  if (targetSlpaths.length !== expectBeforeTargetSLpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSLpathList[i]) {
      throw new Error(``);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'unique_TEST_NOT_FORCED');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
};

/*
 * test target directory
 * test log
 * test extra directory
 */
const test_forced = async () => {
  childProcess.execSync(`node unique ./testwork/unique -s TEST_FORCED -F`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'unique_TEST_FORCED.json'));
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
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'unique_TEST_FORCED');
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
  const actualRecord_digest_no = records.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.no}`;
  }).sort();
  const expectRecord_digest_no = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_digest_no.length; i++) {
    const actual = actualRecord_digest_no[i];
    const expect = expectRecord_digest_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualRecord_digest_newName_oldPath = records.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  const expectRecord_digest_newName_oldPath = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.newName}:${groups.oldPath}`;
  }).sort();
  if (actualRecord_digest_newName_oldPath.length !== expectRecord_digest_newName_oldPath.length) {
    throw new Error(``);
  }
  for (let i = 0; i < actualRecord_digest_newName_oldPath.length; i++) {
    const actual = actualRecord_digest_newName_oldPath[i];
    const expect = expectRecord_digest_newName_oldPath[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/unique').sort();
  const digestSet = new Set();
  for (let i = 0; i < targetFpaths.length; i++) {
    const testPath = targetFpaths[i];
    const digest1 = await utility.getFileDigest(testPath, 'md5');
    const digest2 = await utility.getFileDigest(testPath, 'sha1');
    const digest = `${digest1}_${digest2}`;
    digestSet.add(digest);
  }
  if (targetFpaths.length !== digestSet.size) {
    throw new Error(``);
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/unique');
  if (targetSlpaths.length !== 0) {
    throw new Error(``);
  }
  // test extra directory
  const extraPaths = utility.getFilePaths(execIdDpath).
    concat(utility.getSymbolicLinkPaths(execIdDpath)).
    map(testPath => testPath.replaceAll(path.sep, '/'));
  if (extraPaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  const extraPathRegExp = /^(?:.+)\/(?<digest>syml\.d|[0-9a-z]{32}_[0-9a-z]{40})\/(?<no>\d+)_\d{17}\-(?<name>.+)$/;
  for (let i = 0; i < extraPaths.length; i++) {
    const testPath = extraPaths[i];
    if (!extraPathRegExp.test(testPath)) {
      throw new Error(``);
    }
    const groups = extraPathRegExp.exec(testPath).groups;
    if (groups.digest === 'syml.d') {
      if (!fs.lstatSync(testPath).isSymbolicLink()) {
        throw new Error(``);
      }
    } else {
      if (/^0+$/.test(groups.no)) {
        if (!fs.lstatSync(testPath).isSymbolicLink()) {
          throw new Error(``);
        }
      } else {
        if (!fs.lstatSync(testPath).isFile()) {
          throw new Error(``);
        }
      }
    }
  }
  const actualExtraPath_digest_no = extraPaths.map(testPath => {
    const groups = extraPathRegExp.exec(testPath).groups;
    return `${groups.digest}:${groups.no}`;
  }).sort();
  const expectExtraPath_digest_no = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualExtraPath_digest_no.length; i++) {
    const actual = actualExtraPath_digest_no[i];
    const expect = expectExtraPath_digest_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualExtraPath_digest_name = extraPaths.map(testPath => {
    const groups = extraPathRegExp.exec(testPath).groups;
    return `${groups.digest}:${groups.name}`;
  }).sort();
  const expectExtraPath_digest_name = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.newName}`;
  }).sort();
  for (let i = 0; i < actualExtraPath_digest_name.length; i++) {
    const actual = actualExtraPath_digest_name[i];
    const expect = expectExtraPath_digest_name[i];
    if (actual !== expect) {
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
