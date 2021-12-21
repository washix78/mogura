const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const baseDpath = path.resolve(process.cwd(), 'testwork/comp_base');
const targetDpath = path.resolve(process.cwd(), 'testwork/comp_target');

const resourceBaseFpaths = [
  'file0:file0',
  'file2:dir1/file2_0',
  'file3:dir2/file3_00',
  'file4:dir2/dir1/file4',
  'file5:dir2/dir2/file5',
  'file5:file5'
];
const resourceBaseSlpaths = [
  'file6:dir1/syml6',
  'file8:dir2/syml8'
];
const resourceTargetFpaths = [
  'file1:dir2/dir2/file1',
  'file2:dir2/dir1/file2_1',
  'file2:dir2/file2_2',
  'file2:dir1/file2_3',
  'file2:file2_4',
  'file2:dir2/dir2/file2_5',
  'file2:dir2/dir1/file2_6',
  'file2:dir2/file2_7',
  'file2:dir1/file2_8',
  'file2:file2_9',
  'file3:dir2/dir2/file3_01',
  'file3:dir2/dir1/file3_02',
  'file3:dir2/file3_03',
  'file3:dir1/file3_04',
  'file3:file3_05',
  'file3:dir2/dir2/file3_06',
  'file3:dir2/dir1/file3_07',
  'file3:dir2/file3_08',
  'file3:dir1/file3_09',
  'file3:file3_10',
  'file4:dir2/dir2/file4',
  'file4:dir2/dir1/file4',
  'file4:dir2/dir1/99_76543210987654321-file4',
  'file5:dir2/file5',
  'file9:dir2/file9'
];
const resourceTargetSlpaths = [
  'file7:dir1/syml7',
  'file8:syml8',
  'file8:dir2/dir2/syml8',
  'file8:dir2/dir1/99_76543210987654321-syml8'
];

const expectRecordList = [
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/00_12345678901234567-file2_0:dir1/file2_0',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/11_12345678901234567-file2_1:dir2/dir1/file2_1',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/12_12345678901234567-file2_2:dir2/file2_2',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/13_12345678901234567-file2_3:dir1/file2_3',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/14_12345678901234567-file2_4:file2_4',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/15_12345678901234567-file2_5:dir2/dir2/file2_5',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/16_12345678901234567-file2_6:dir2/dir1/file2_6',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/17_12345678901234567-file2_7:dir2/file2_7',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/18_12345678901234567-file2_8:dir1/file2_8',
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04/19_12345678901234567-file2_9:file2_9',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/000_12345678901234567-file3_00:dir2/file3_00',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/101_12345678901234567-file3_01:dir2/dir2/file3_01',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/102_12345678901234567-file3_02:dir2/dir1/file3_02',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/103_12345678901234567-file3_03:dir2/file3_03',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/104_12345678901234567-file3_04:dir1/file3_04',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/105_12345678901234567-file3_05:file3_05',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/106_12345678901234567-file3_06:dir2/dir2/file3_06',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/107_12345678901234567-file3_07:dir2/dir1/file3_07',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/108_12345678901234567-file3_08:dir2/file3_08',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/109_12345678901234567-file3_09:dir1/file3_09',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/110_12345678901234567-file3_10:file3_10',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/00_12345678901234567-file4:dir2/dir1/file4',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/11_12345678901234567-file4:dir2/dir2/file4',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/12_12345678901234567-file4:dir2/dir1/file4',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/13_12345678901234567-file4:dir2/dir1/99_76543210987654321-file4',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/00_12345678901234567-file5:file5',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/01_12345678901234567-file5:dir2/dir2/file5',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/12_12345678901234567-file5:dir2/file5',
  'syml.d/10_12345678901234567-syml7:dir1/syml7',
  'syml.d/11_12345678901234567-syml8:dir2/dir2/syml8',
  'syml.d/12_12345678901234567-syml8:dir2/dir1/99_76543210987654321-syml8',
  'syml.d/13_12345678901234567-syml8:syml8'
];
const recordRegExp = /^(?<digest>syml\.d|[0-9a-z]{32}_[0-9a-z]{40})\/(?<type>\d)(?<no>\d+)_\d{17}\-(?<newName>.+)\:(?<oldPath>.+)$/;
const expectBaseFpathList = [
  'file0',
  'dir1/file2_0',
  'dir2/file3_00',
  'dir2/dir1/file4',
  'dir2/dir2/file5',
  'file5'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectBaseSlpathList = [
  'dir1/syml6',
  'dir2/syml8'
].map(testPath => path.resolve(baseDpath, testPath)).sort();
const expectBeforeTargetFpathList = [
  'dir2/dir2/file1',
  'dir2/dir1/file2_1',
  'dir2/file2_2',
  'dir1/file2_3',
  'file2_4',
  'dir2/dir2/file2_5',
  'dir2/dir1/file2_6',
  'dir2/file2_7',
  'dir1/file2_8',
  'file2_9',
  'dir2/dir2/file3_01',
  'dir2/dir1/file3_02',
  'dir2/file3_03',
  'dir1/file3_04',
  'file3_05',
  'dir2/dir2/file3_06',
  'dir2/dir1/file3_07',
  'dir2/file3_08',
  'dir1/file3_09',
  'file3_10',
  'dir2/dir2/file4',
  'dir2/dir1/file4',
  'dir2/dir1/99_76543210987654321-file4',
  'dir2/file5',
  'dir2/file9'
].map(testPath => path.resolve(targetDpath, testPath)).sort();
const expectBeforeTargetSlpathList = [
  'dir1/syml7',
  'syml8',
  'dir2/dir2/syml8',
  'dir2/dir1/99_76543210987654321-syml8'
].map(testPath => path.resolve(targetDpath, testPath)).sort();
const expectAfterTargetFpathList = [
  'dir2/dir2/file1',
  'dir2/file9'
].map(testPath => path.resolve(targetDpath, testPath)).sort();

// test log
// test base directory
// test target directory
// test extra directory
const test_not_forced = async () => {
  childProcess.execSync(`node comp ./testwork/comp_base ./testwork/comp_target -s TEST_NOT_FORCED`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'comp_TEST_NOT_FORCED.json'));
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
  if (info['Forced'] !== false) {
    throw new Error(``);
  }
  if (info['Extra directory'] !== null) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(``);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/'));
  for (let i = 0; i < records.length; i++) {
    if (!recordRegExp.test(records[i])) {
      throw new Error(``);
    }
  }
  const actualRecord_digest_type_no = records.map(record => {
    const groups = recordRegExp.exec(record);
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  const expectRecord_digest_type_no = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record);
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_digest_type_no.length; i++) {
    const actual = actualRecord_digest_type_no[i];
    const expect = expectRecord_digest_type_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualRecord_digest_newName_oldPath = records.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.newName}:${groups.oldPath}`;
  }).sort()
  const expectRecord_digest_newName_oldPath = records.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.newName}:${groups.oldPath}`;
  }).sort();
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
  // test base directory
  const baseFpaths = utility.getFilePaths('./testwork/comp_base').sort();
  if (baseFpaths.length !== expectBaseFpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < baseFpaths.length; i++) {
    if (baseFpaths[i] !== expectBaseFpathList[i]) {
      throw new Error(``);
    }
  }
  const baseSlpaths = utility.getSymbolicLinkPaths('./testwork/comp_base').sort();
  if (baseSlpaths.length !== expectBaseSlpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < baseSlpaths.length; i++) {
    if (baseSlpaths[i] !== expectBaseSlpathList[i]) {
      throw new Error(``);
    }
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/comp_target').sort();
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectBeforeTargetFpathList[i]) {
      throw new Error(``);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/comp_target').sort();
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    if (targetSlpaths[i] !== expectBeforeTargetSlpathList[i]) {
      throw new Error(``);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'comp_TEST_NOT_FORCED');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
};

// test log
// test base directory
// test target directory
// test extra directory
const test_forced = async () => {
  childProcess.execSync(`node comp ./testwork/comp_base ./testwork/comp_target -s TEST_FORCED -F`);

  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'comp_TEST_FORCED.json'));
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
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'comp_TEST_FORCED');
  if (info['Extra directory'] !== execIdDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(``);
  }
  const records = info['Records'].map(record => record.replaceAll(path.sep, '/'));
  for (let i = 0; i < records.length; i++) {
    if (!recordRegExp.test(records[i])) {
      throw new Error(``);
    }
  }
  const actualRecord_digest_type_no = records.map(record => {
    const groups = recordRegExp.exec(record);
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  const expectRecord_digest_type_no = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record);
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_digest_type_no.length; i++) {
    const actual = actualRecord_digest_type_no[i];
    const expect = expectRecord_digest_type_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  const actualRecord_digest_newName_oldPath = records.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.newName}:${groups.oldPath}`;
  }).sort()
  const expectRecord_digest_newName_oldPath = records.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.newName}:${groups.oldPath}`;
  }).sort();
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
  // test base directory
  const baseFpaths = utility.getFilePaths('./testwork/comp_base').sort();
  if (baseFpaths.length !== expectBaseFpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < baseFpaths.length; i++) {
    if (baseFpaths[i] !== expectBaseFpathList[i]) {
      throw new Error(``);
    }
  }
  const baseSlpaths = utility.getSymbolicLinkPaths('./testwork/comp_base');
  if (baseSlpaths.length !== expectBaseSlpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < baseSlpaths.length; i++) {
    if (baseSlpaths[i] !== expectBaseSlpathList[i]) {
      throw new Error(``);
    }
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/comp_target').sort();
  if (targetFpaths.length !== expectAfterTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    if (targetFpaths[i] !== expectAfterTargetFpathList[i]) {
      throw new Error(``);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/comp_target');
  if (targetSlpaths.length !== 0) {
    throw new Error(``);
  }
  // test extra directory
  const extraPaths = utility.getFilePaths(execIdDpath).concat(
    utility.getSymbolicLinkPaths(execIdDpath)
  );
  if (extraPaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  const extraPathRegExp = /^(?:.+)\/(?<digest>syml\.d|[0-9a-z]{32}_[0-9a-z]{40})\/(?<type>\d)(?<no>\d+)_\d{17}\-(?<name>.+)$/;
  for (let i = 0; i < extraPaths.length; i++) {
    const extraPath = extraPaths[i];
    if (!extraPathRegExp.test(extraPath)) {
      throw new Error(``);
    }
    const groups = extraPathRegExp.exec(extraPath).groups;
    if (groups.digest === 'syml.d') {
      if (!fs.lstatSync(extraPath).isSymbolicLink()) {
        throw new Error(``);
      }
    } else {
      if (groups.type === '0') {
        if (!fs.lstatSync(extraPath).isSymbolicLink()) {
          throw new Error(``);
        }
      } else {
        if (!fs.lstatSync(extraPath).isFile()) {
          throw new Error(``);
        }
      }
    }
  }
  const actualExtraPath_digest_type_no = extraPaths.map(testPath => {
    const groups = extraPathRegExp.exec(testPath).groups;
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  const expectExtraPath_digest_type_no = expectRecordList.map(record => {
    const groups = recordRegExp.exec(record).groups;
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualExtraPath_digest_type_no.length; i++) {
    const actual = actualExtraPath_digest_type_no[i];
    const expect = expectExtraPath_digest_type_no[i];
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
  utility.generateResourceFiles(baseDpath, resourceBaseFpaths);
  utility.generateResourceSymbolicLinks(baseDpath, resourceBaseSlpaths);
  fs.emptyDirSync(targetDpath);
  utility.generateResourceFiles(targetDpath, resourceTargetFpaths);
  utility.generateResourceSymbolicLinks(targetDpath, resourceTargetSlpaths);

  await test_not_forced();
  await test_forced();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
