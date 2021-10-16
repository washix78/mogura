const childProcess = require('child_process');
const fs = require('fs-extra');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const expectBeforeTargetFpathList = [
  `${process.cwd()}/testwork/unique/file1`,
  `${process.cwd()}/testwork/unique/dir2/file3`,
  `${process.cwd()}/testwork/unique/dir2/dir1/file3`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file3`,
  `${process.cwd()}/testwork/unique/file5`,
  `${process.cwd()}/testwork/unique/dir2/dir1/file5`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file5`,
  `${process.cwd()}/testwork/unique/dir2/file6`,
  `${process.cwd()}/testwork/unique/dir1/file7`,
  `${process.cwd()}/testwork/unique/dir2/file7`,
  `${process.cwd()}/testwork/unique/dir2/file7_2`,
  `${process.cwd()}/testwork/unique/dir2/dir1/99_12345678901234567-00_76543210987654321-file7`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file8`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file8_1`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file8_2`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file8_3`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file8_4`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file8_5`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file8_6`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file8_7`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file8_8`,
  `${process.cwd()}/testwork/unique/dir2/dir2/file8_9`,
  `${process.cwd()}/testwork/unique/file9`,
  `${process.cwd()}/testwork/unique/file9_0`,
  `${process.cwd()}/testwork/unique/file9_1`,
  `${process.cwd()}/testwork/unique/file9_2`,
  `${process.cwd()}/testwork/unique/file9_3`,
  `${process.cwd()}/testwork/unique/file9_4`,
  `${process.cwd()}/testwork/unique/file9_5`,
  `${process.cwd()}/testwork/unique/file9_6`,
  `${process.cwd()}/testwork/unique/file9_7`,
  `${process.cwd()}/testwork/unique/file9_8`,
  `${process.cwd()}/testwork/unique/file9_9`
];
const expectBeforeTargetSLpathList = [
  `${process.cwd()}/testwork/unique/dir1/syml2`,
  `${process.cwd()}/testwork/unique/syml4`,
  `${process.cwd()}/testwork/unique/dir1/syml4`,
  `${process.cwd()}/testwork/unique/dir2/syml4`,
  `${process.cwd()}/testwork/unique/dir1/syml5`,
  `${process.cwd()}/testwork/unique/syml6`,
  `${process.cwd()}/testwork/unique/dir2/dir1/syml6`,
  `${process.cwd()}/testwork/unique/dir2/dir2/syml6`
];
const expectAfterTargetFdigestList = [
  '7c12772809c1c0c3deda6103b10fdfa0_12039d6dd9a7e27622301e935b6eefc78846802e',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0',
  '81da367b96d5993f378765ba0bbf65f8_8ffed04ae79504b0ea69b221fbc7c3e2782e079d',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5'
];
const expectAfterTargetSldigestList = [
  'c688a57c326c2484f8048268b1c50685_c8d45b1619605a32e9e366a4440e5e1cb577fe04',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213'
];
const expectRecordList = [
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/10_12345678901234567-file3:dir2/file3',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/11_12345678901234567-file3:dir2/dir1/file3',
  'dc22d5df571ecd8e2068ec4a6081b103_5bce893fa55f734f9abc23c3225f13eb3c2badb6/12_12345678901234567-file3:dir2/dir2/file3',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/00_12345678901234567-syml4:dir1/syml4',
  'a01e1b472807c463009d7596d6e31b36_fe27e2d0f667455448c43bf609ac3a253217f213/01_12345678901234567-syml4:dir2/syml4',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/00_12345678901234567-syml5:dir1/syml5',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/10_12345678901234567-file5:file5',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/11_12345678901234567-file5:dir2/dir1/file5',
  'e02666c45584eeaf108a5782fc35c04e_e02ec50ce0d2957bcecc3879408eb725feb530d0/12_12345678901234567-file5:dir2/dir2/file5',
  '81da367b96d5993f378765ba0bbf65f8_8ffed04ae79504b0ea69b221fbc7c3e2782e079d/00_12345678901234567-syml6:syml6',
  '81da367b96d5993f378765ba0bbf65f8_8ffed04ae79504b0ea69b221fbc7c3e2782e079d/01_12345678901234567-syml6:dir2/dir1/syml6',
  '81da367b96d5993f378765ba0bbf65f8_8ffed04ae79504b0ea69b221fbc7c3e2782e079d/02_12345678901234567-syml6:dir2/dir2/syml6',
  '81da367b96d5993f378765ba0bbf65f8_8ffed04ae79504b0ea69b221fbc7c3e2782e079d/10_12345678901234567-file6:dir2/file6',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/10_12345678901234567-file7:dir1/file7',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/11_12345678901234567-file7:dir2/file7',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/12_12345678901234567-file7_2:dir2/file7_2',
  'a37efd016a6761a0a0a95b74c685b2d9_ca191b01af2bbdd2097a0c76a1ac2fb3f24665ef/13_12345678901234567-00_76543210987654321-file7:dir2/dir1/99_12345678901234567-00_76543210987654321-file7',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/10_12345678901234567-file8:dir2/dir2/file8',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/11_12345678901234567-file8_1:dir2/dir2/file8_1',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/12_12345678901234567-file8_2:dir2/dir2/file8_2',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/13_12345678901234567-file8_3:dir2/dir2/file8_3',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/14_12345678901234567-file8_4:dir2/dir2/file8_4',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/15_12345678901234567-file8_5:dir2/dir2/file8_5',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/16_12345678901234567-file8_6:dir2/dir2/file8_6',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/17_12345678901234567-file8_7:dir2/dir2/file8_7',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/18_12345678901234567-file8_8:dir2/dir2/file8_8',
  'a780b67cb215c4c6455281ecaeec2721_f715022c4ac85560ac9a6902f8ae29da723cf274/19_12345678901234567-file8_9:dir2/dir2/file8_9',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5/100_12345678901234567-file9:file9',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5/101_12345678901234567-file9_0:file9_0',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5/102_12345678901234567-file9_1:file9_1',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5/103_12345678901234567-file9_2:file9_2',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5/104_12345678901234567-file9_3:file9_3',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5/105_12345678901234567-file9_4:file9_4',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5/106_12345678901234567-file9_5:file9_5',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5/107_12345678901234567-file9_6:file9_6',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5/108_12345678901234567-file9_7:file9_7',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5/109_12345678901234567-file9_8:file9_8',
  'bc1e7a7d05405d2c1c755bc6083d4f59_92ee59b567d89dfb4bc004dd8ec4cb53c8e502f5/110_12345678901234567-file9_9:file9_9',
];
const recordRegexp = /^(?<digest>[0-9a-z]{32}_[0-9a-z]{40})\/(?<type>\d)(?<no>\d+)_\d{17}\-(?<newName>.+)\:(?<oldPath>(?:.+\/)*.+)$/;

/*
 * test target directory
 * test extra directory
 * test log
 */
const test_not_forced = async () => {
  childProcess.execSync(`node unique ./testwork/unique -s TEST_NOT_FORCED`);

  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/unique');
  if (targetFpaths.length !== expectBeforeTargetFpathList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    const matched = expectBeforeTargetFpathList.filter(expect => expect === targetFpaths[i]);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/unique');
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
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'unique_TEST_NOT_FORCED');
  if (execIdDpath !== null) {
    throw new Error(`${execIdDpath}`);
  }
  // test log
  const info = require(utility.getLatestFpath('./logs', timestamp, 'unique_TEST_NOT_FORCED.json'));
  if (info['Target directory'] !== `${process.cwd()}/testwork/unique`) {
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
  const actualRecord_digest_type_no = info['Records'].map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  const expectRecord_digest_type_no = expectRecordList.map(record => {
    const groups = recordRegexp.exec(record).groups;
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

/*
 * test target directory
 * test log
 * test extra directory
 */
const test_forced = async () => {
  childProcess.execSync(`node unique ./testwork/unique -s TEST_FORCED -F`);

  // test target directory
  const targetFpaths = utility.getFilePaths('./testwork/unique');
  if (targetFpaths.length !== expectAfterTargetFdigestList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetFpaths.length; i++) {
    const testPath = targetFpaths[i];
    const digest1 = await utility.getFileDigest(testPath, 'md5');
    const digest2 = await utility.getFileDigest(testPath, 'sha1');
    const digest = `${digest1}_${digest2}`;
    const matched = expectAfterTargetFdigestList.filter(expect => expect === digest);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  const targetSlpaths = utility.getSymbolicLinkPaths('./testwork/unique');
  if (targetSlpaths.length !== expectAfterTargetSldigestList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < targetSlpaths.length; i++) {
    const testPath = targetSlpaths[i];
    const digest1 = await utility.getFileDigest(testPath, 'md5');
    const digest2 = await utility.getFileDigest(testPath, 'sha1');
    const digest = `${digest1}_${digest2}`;
    const matched = expectAfterTargetSldigestList.filter(expect => expect === digest);
    if (matched.length !== 1) {
      throw new Error(``);
    }
  }
  // test extra directory
  const execIdDpath = utility.getLatestDpath('./extra', timestamp, 'unique_TEST_FORCED');
  const extraPaths = utility.getFilePaths(execIdDpath).concat(utility.getSymbolicLinkPaths(execIdDpath));
  if (extraPaths.length !== expectRecordList.length) {
    throw new Error(``);
  }
  const extraPathRegexp = /^(?:\/.+)+(?<digest>[0-9a-z]{32}_[0-9a-z]{40})\/(?<type>\d)(?<no>\d+)_\d{17}\-(?<name>.+)$/;
  for (let i = 0; i < extraPaths.length; i++) {
    const testPath = extraPaths[i];
    if (!extraPathRegexp.test(testPath)) {
      throw new Error(``);
    }
    const groups = extraPathRegexp.exec(testPath).groups;
    if (groups.type === '0') {
      if (!fs.lstatSync(testPath).isSymbolicLink()) {
        throw new Error(``);
      }
    } else if (groups.type === '1') {
      if (/^0+$/.test(groups.no)) {
        if (!fs.lstatSync(testPath).isSymbolicLink()) {
          throw new Error(``);
        }
      } else {
        if (!fs.lstatSync(testPath).isFile()) {
          throw new Error(``);
        }
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
  const info = require(utility.getLatestFpath('./logs', timestamp, 'unique_TEST_FORCED.json'));
  if (info['Target directory'] !== `${process.cwd()}/testwork/unique`) {
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
  const actualRecord_digest_type_no = info['Records'].map(record => {
    const groups = recordRegexp.exec(record).groups;
    return `${groups.digest}:${groups.type}:${groups.no}`;
  }).sort();
  const expectRecord_digest_type_no = expectRecordList.map(record => {
    const groups = recordRegexp.exec(record).groups;
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
  fs.emptyDirSync('./testwork/unique');
  fs.copySync('./test/resources/unique', './testwork/unique');

  await test_not_forced();
  await test_forced();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
