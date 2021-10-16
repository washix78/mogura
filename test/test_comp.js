const childProcess = require('child_process');
const fs = require('fs-extra');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const expectBaseFpathList = [
  `${process.cwd()}/testwork/comp_base/file1`,
  `${process.cwd()}/testwork/comp_base/dir2/file3`,
  `${process.cwd()}/testwork/comp_base/file5`,
  `${process.cwd()}/testwork/comp_base/dir2/dir2/file5`,
  `${process.cwd()}/testwork/comp_base/dir2/dir1/file6`,
  `${process.cwd()}/testwork/comp_base/dir2/dir2/file7`,
  `${process.cwd()}/testwork/comp_base/file8`
];
const expectBaseSlpathList = [
  `${process.cwd()}/testwork/comp_base/dir1/syml1`,
  `${process.cwd()}/testwork/comp_base/dir2/dir1/syml4`,
  `${process.cwd()}/testwork/comp_base/dir1/syml5`,
  `${process.cwd()}/testwork/comp_base/dir2/syml5`
];
const expectBeforeTargetFpathList = [
  `${process.cwd()}/testwork/comp_target/file2`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file4`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file4`,
  `${process.cwd()}/testwork/comp_target/file5`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file5`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file5`,
  `${process.cwd()}/testwork/comp_target/dir2/file6`,
  `${process.cwd()}/testwork/comp_target/dir2/file6_2`,
  `${process.cwd()}/testwork/comp_target/dir1/99_12345678901234567-file6`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file7_1`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file7_2`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file7_3`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file7_4`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file7_5`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file7_6`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file7_7`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file7_8`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file7_9`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file8_0`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file8_1`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file8_2`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file8_3`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file8_4`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file8_5`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file8_6`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file8_7`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file8_8`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file8_9`
];
const expectBeforeTargetSlpathList = [
  `${process.cwd()}/testwork/comp_target/dir2/dir2/syml2`,
  `${process.cwd()}/testwork/comp_target/dir1/syml3`,
  `${process.cwd()}/testwork/comp_target/dir2/syml3`,
  `${process.cwd()}/testwork/comp_target/syml5`,
  `${process.cwd()}/testwork/comp_target/dir1/syml5`,
  `${process.cwd()}/testwork/comp_target/dir2/syml5`
];
const expectAfterTargetFpathList = [
  `${process.cwd()}/testwork/comp_target/file2`,
  `${process.cwd()}/testwork/comp_target/dir2/dir2/file4`,
  `${process.cwd()}/testwork/comp_target/dir2/dir1/file4`
];
const expectAfterTargetSlpathList = [
  `${process.cwd()}/testwork/comp_target/dir2/dir2/syml2`
];
const expectRecordList = [
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/010_12345678901234567-file3:dir2/file3',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/100_12345678901234567-syml3:dir1/syml3',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/101_12345678901234567-syml3:dir2/syml3',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/010_12345678901234567-file5:file5',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/100_12345678901234567-syml5:dir2/syml5',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/101_12345678901234567-syml5:syml5',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/102_12345678901234567-syml5:dir1/syml5',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/110_12345678901234567-file5:dir2/dir1/file5',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/111_12345678901234567-file5:file5',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/112_12345678901234567-file5:dir2/dir2/file5',
  '81da367b96d5993f378765ba0bbf65f8_8ffed04ae79504b0ea69b221fbc7c3e2782e079d/010_12345678901234567-file6:dir2/dir1/file6',
  '81da367b96d5993f378765ba0bbf65f8_8ffed04ae79504b0ea69b221fbc7c3e2782e079d/110_12345678901234567-file6:dir2/file6',
  '81da367b96d5993f378765ba0bbf65f8_8ffed04ae79504b0ea69b221fbc7c3e2782e079d/111_12345678901234567-file6_2:dir2/file6_2',
  '81da367b96d5993f378765ba0bbf65f8_8ffed04ae79504b0ea69b221fbc7c3e2782e079d/112_12345678901234567-file6:dir1/99_12345678901234567-file6',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/010_12345678901234567-file7:dir2/dir2/file7',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/110_12345678901234567-file7_1:dir2/dir1/file7_1',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/111_12345678901234567-file7_2:dir2/dir1/file7_2',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/112_12345678901234567-file7_3:dir2/dir1/file7_3',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/113_12345678901234567-file7_4:dir2/dir1/file7_4',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/114_12345678901234567-file7_5:dir2/dir1/file7_5',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/115_12345678901234567-file7_6:dir2/dir1/file7_6',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/116_12345678901234567-file7_7:dir2/dir1/file7_7',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/117_12345678901234567-file7_8:dir2/dir1/file7_8',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/118_12345678901234567-file7_9:dir2/dir1/file7_9',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/0100_12345678901234567-file8:file8',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/1100_12345678901234567-file8_0:dir2/dir2/file8_0',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/1101_12345678901234567-file8_1:dir2/dir2/file8_1',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/1102_12345678901234567-file8_2:dir2/dir2/file8_2',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/1103_12345678901234567-file8_3:dir2/dir2/file8_3',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/1104_12345678901234567-file8_4:dir2/dir2/file8_4',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/1105_12345678901234567-file8_5:dir2/dir2/file8_5',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/1106_12345678901234567-file8_6:dir2/dir2/file8_6',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/1107_12345678901234567-file8_7:dir2/dir2/file8_7',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/1108_12345678901234567-file8_8:dir2/dir2/file8_8',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/1109_12345678901234567-file8_9:dir2/dir2/file8_9',
];
const recordRegexp = /^(?<digest>[0-9a-z]{32}_[0-9a-z]{40})\/(?<type>\d{2})(?<no>\d+)_\d{17}\-(?<newName>.+)\:(?<oldPath>(?:.+\/)*.+)$/;

// test base directory
// test target directory
// test extra directory
// test log
const test_not_forced = async () => {
  childProcess.execSync(`node comp ./testwork/comp_base ./testwork/comp_target -s TEST_NOT_FORCED`);

  // test base directory
  const baseFpaths = utility.getFilePaths('./testwork/comp_base');
  if (baseFpaths.length !== expectBaseFpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < baseFpaths.length; i++) {
    const testPath = baseFpaths[i];
    const matched = expectBaseFpathList.filter(expect => expect === testPath);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  const baseSlpaths = utility.getSymbolicLinkPaths('./testwork/comp_base');
  if (baseSlpaths.length !== expectBaseSlpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < baseSlpaths.length; i++) {
    const testPath = baseSlpaths[i];
    const matched = expectBaseSlpathList.filter(expect => expect === testPath);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/comp_target');
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    const testPath = targetFpaths[i];
    const matched = expectBeforeTargetFpathList.filter(expect => expect === testPath);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/comp_target');
  if (targetSlpaths.length !== expectBeforeTargetSlpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    const testPath = targetSlpaths[i];
    const matched = expectBeforeTargetSlpathList.filter(expect => expect === testPath);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'comp_TEST_NOT_FORCED');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'comp_TEST_NOT_FORCED.json'));
  if (info['Base directory'] !== `${process.cwd()}/testwork/comp_base`) {
    throw new Error(``);
  }
  if (info['Base file count'] !== expectBaseFpathList.length) {
    throw new Error(``);
  }
  if (info['Base symbolic link count'] !== expectBaseSlpathList.length) {
    throw new Error(``);
  }
  if (info['Target directory'] !== `${process.cwd()}/testwork/comp_target`) {
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
  for (let i = 0; i < info['Records'].length; i++) {
    if (!recordRegexp.test(info['Records'][i])) {
      throw new Error(``);
    }
  }
  const actualRecord_digest_type_no = info['Records'].map(record => {
    const groups = recordRegexp.exec(record);
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  const expectRecord_digest_type_no = expectRecordList.map(record => {
    const groups = recordRegexp.exec(record);
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_digest_type_no.length; i++) {
    const actual = actualRecord_digest_type_no[i];
    const expect = expectRecord_digest_type_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
};

// test base directory
// test target directory
// test extra directory
// test log
const test_forced = async () => {
  childProcess.execSync(`node comp ./testwork/comp_base ./testwork/comp_target -s TEST_FORCED -F`);

  // test base directory
  const baseFpaths = utility.getFilePaths('./testwork/comp_base');
  if (baseFpaths.length !== expectBaseFpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < baseFpaths.length; i++) {
    const testPath = baseFpaths[i];
    const matched = expectBaseFpathList.filter(expect => expect === testPath);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  const baseSlpaths = utility.getSymbolicLinkPaths('./testwork/comp_base');
  if (baseSlpaths.length !== expectBaseSlpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < baseSlpaths.length; i++) {
    const testPath = baseSlpaths[i];
    const matched = baseSlpaths.filter(expect => expect === testPath);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/comp_target');
  if (targetFpaths.length !== expectAfterTargetFpathList.length) {
    throw new Error(`${targetFpaths.length}`);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    const testPath = targetFpaths[i];
    const matched = expectAfterTargetFpathList.filter(expect => expect === testPath);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/comp_target');
  if (targetSlpaths.length !== expectAfterTargetSlpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    const testPath = targetSlpaths[i];
    const matched = expectAfterTargetSlpathList.filter(expect => expect === testPath);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'comp_TEST_FORCED');
  const extraPaths = utility.getFilePaths(execIdDpath).concat(utility.getSymbolicLinkPaths(execIdDpath));
  if (extraPaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  const extraPathRegexp = /^(?:\/.+)+(?<digest>[0-9a-z]{32}_[0-9a-z]{40})\/(?<type>\d{2})(?<no>\d+)_\d{17}\-(?<name>.+)$/;
  for (let i = 0; i < extraPaths.length; i++) {
    const extraPath = extraPaths[i];
    if (!extraPathRegexp.test(extraPath)) {
      throw new Error(``);
    }
    const groups = extraPathRegexp.exec(extraPath).groups;
    if (groups.type === '01') {
      if (!fs.lstatSync(extraPath).isSymbolicLink()) {
        throw new Error(``);
      }
    } else if (groups.type === '10') {
      if (!fs.lstatSync(extraPath).isSymbolicLink()) {
        throw new Error(``);
      }
    } else if (groups.type === '11') {
      if (!fs.lstatSync(extraPath).isFile()) {
        throw new Error(``);
      }
    } else {
      throw new Error(``);
    }
  }
  const actualExtraPath_digest_type_no = extraPaths.map(testPath => {
    const groups = extraPathRegexp.exec(testPath).groups;
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  const expectExtraPath_digest_type_no = expectRecordList.map(record => {
    const groups = recordRegexp.exec(record).groups;
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
    const groups = extraPathRegexp.exec(testPath).groups;
    return `${groups.digest}:${groups.name}`;
  }).sort();
  const expectExtraPath_digest_name = expectRecordList.map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.digest}:${groups.newName}`;
  }).sort();
  for (let i = 0; i < actualExtraPath_digest_name.length; i++) {
    const actual = actualExtraPath_digest_name[i];
    const expect = expectExtraPath_digest_name[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'comp_TEST_FORCED.json'));
  if (info['Base directory'] !== `${process.cwd()}/testwork/comp_base`) {
    throw new Error(``);
  }
  if (info['Base file count'] !== expectBaseFpathList.length) {
    throw new Error(``);
  }
  if (info['Base symbolic link count'] !== expectBaseSlpathList.length) {
    throw new Error(``);
  }
  if (info['Target directory'] !== `${process.cwd()}/testwork/comp_target`) {
    throw new Error(``);
  }
  if (info['Target file count'] !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  if (info['Target symbolic link count'] !== expectBeforeTargetSlpathList.length) {
    throw new Error(``);
  }
  if (info['Forced'] !== true) {
    throw new Error(``);
  }
  if (info['Extra directory'] !== execIdDpath) {
    throw new Error(`Extra directory: ${info['Extra directory']}`);
  }
  if (info['Records'].length !== expectRecordList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < info['Records'].length; i++) {
    if (!recordRegexp.test(info['Records'][i])) {
      throw new Error(``);
    }
  }
  const actualRecord_digest_type_no = info['Records'].map(record => {
    const groups = recordRegexp.exec(record);
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  const expectRecord_digest_type_no = expectRecordList.map(record => {
    const groups = recordRegexp.exec(record);
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  for (let i = 0; i < actualRecord_digest_type_no.length; i++) {
    const actual = actualRecord_digest_type_no[i];
    const expect = expectRecord_digest_type_no[i];
    if (actual !== expect) {
      throw new Error(``);
    }
  }
  if (!(-1 < info['Time'])) {
    throw new Error(`Time: ${info['Time']}`);
  }
};

const main = async () => {
  fs.emptyDirSync('./testwork/comp_base');
  fs.emptyDirSync('./testwork/comp_target');
  fs.copySync('./test/resources/comp_base', './testwork/comp_base');
  fs.copySync('./test/resources/comp_target', './testwork/comp_target');

  await test_not_forced();
  await test_forced();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
