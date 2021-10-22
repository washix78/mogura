const childProcess = require('child_process');
const path = require('path');
const utility = require('../utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);

const expectLog = {
  'Target directory': `${process.cwd()}/test/resources/header`,
  'Target file count': 15,
  'Target symbolic link count': 15,
  'Headers': {
    '': [
      `0:${process.cwd()}/test/resources/header/file_0`
    ],
    '00010203': [
      `4:${process.cwd()}/test/resources/header/dir2/file_4_00`
    ],
    '01020304': [
      `4:${process.cwd()}/test/resources/header/dir2/dir2/file_4_01`
    ],
    '0001020304': [
      `5:${process.cwd()}/test/resources/header/dir1/file_5_00`
    ],
    '0102030405': [
      `5:${process.cwd()}/test/resources/header/dir2/dir1/file_5_01`
    ],
    '000102030405060708': [
      `9:${process.cwd()}/test/resources/header/file_9_00`
    ],
    '010203040506070809': [
      `9:${process.cwd()}/test/resources/header/dir2/file_9_01`
    ],
    '00010203040506070809': [
      `10:${process.cwd()}/test/resources/header/dir2/dir2/file_10_00`,
      `14:${process.cwd()}/test/resources/header/dir2/dir1/file_14_00`,
      `15:${process.cwd()}/test/resources/header/dir2/file_15_00`,
      `16:${process.cwd()}/test/resources/header/dir1/file_16_00`
    ],
    '0102030405060708090a': [
      `10:${process.cwd()}/test/resources/header/dir1/file_10_01`,
      `14:${process.cwd()}/test/resources/header/file_14_01`,
      `15:${process.cwd()}/test/resources/header/dir2/dir2/file_15_01`,
      `16:${process.cwd()}/test/resources/header/dir2/dir1/file_16_01`
    ]
  },
  'Time': -1
};
const expectLogN5 = {
  'Target directory': `${process.cwd()}/test/resources/header`,
  'Target file count': 15,
  'Target symbolic link count': 15,
  'Headers': {
    '': [
      `0:${process.cwd()}/test/resources/header/file_0`
    ],
    '00010203': [
      `4:${process.cwd()}/test/resources/header/dir2/file_4_00`
    ],
    '01020304': [
      `4:${process.cwd()}/test/resources/header/dir2/dir2/file_4_01`
    ],
    '0001020304': [
      `5:${process.cwd()}/test/resources/header/dir1/file_5_00`,
      `9:${process.cwd()}/test/resources/header/file_9_00`,
      `10:${process.cwd()}/test/resources/header/dir2/dir2/file_10_00`,
      `14:${process.cwd()}/test/resources/header/dir2/dir1/file_14_00`,
      `15:${process.cwd()}/test/resources/header/dir2/file_15_00`,
      `16:${process.cwd()}/test/resources/header/dir1/file_16_00`
    ],
    '0102030405': [
      `5:${process.cwd()}/test/resources/header/dir2/dir1/file_5_01`,
      `9:${process.cwd()}/test/resources/header/dir2/file_9_01`,
      `10:${process.cwd()}/test/resources/header/dir1/file_10_01`,
      `14:${process.cwd()}/test/resources/header/file_14_01`,
      `15:${process.cwd()}/test/resources/header/dir2/dir2/file_15_01`,
      `16:${process.cwd()}/test/resources/header/dir2/dir1/file_16_01`
    ]
  },
  'Time': -1
};
const expectLogN15 = {
  'Target directory': `${process.cwd()}/test/resources/header`,
  'Target file count': 15,
  'Target symbolic link count': 15,
  'Headers': {
    '': [
      `0:${process.cwd()}/test/resources/header/file_0`
    ],
    '00010203': [
      `4:${process.cwd()}/test/resources/header/dir2/file_4_00`
    ],
    '01020304': [
      `4:${process.cwd()}/test/resources/header/dir2/dir2/file_4_01`
    ],
    '0001020304': [
      `5:${process.cwd()}/test/resources/header/dir1/file_5_00`
    ],
    '0102030405': [
      `5:${process.cwd()}/test/resources/header/dir2/dir1/file_5_01`
    ],
    '000102030405060708': [
      `9:${process.cwd()}/test/resources/header/file_9_00`
    ],
    '010203040506070809': [
      `9:${process.cwd()}/test/resources/header/dir2/file_9_01`
    ],
    '00010203040506070809': [
      `10:${process.cwd()}/test/resources/header/dir2/dir2/file_10_00`,
    ],
    '0102030405060708090a': [
      `10:${process.cwd()}/test/resources/header/dir1/file_10_01`
    ],
    '000102030405060708090a0b0c0d': [
      `14:${process.cwd()}/test/resources/header/dir2/dir1/file_14_00`
    ],
    '0102030405060708090a0b0c0d0e': [
      `14:${process.cwd()}/test/resources/header/file_14_01`
    ],
    '000102030405060708090a0b0c0d0e': [
      `15:${process.cwd()}/test/resources/header/dir2/file_15_00`,
      `16:${process.cwd()}/test/resources/header/dir1/file_16_00`
    ],
    '0102030405060708090a0b0c0d0e0f': [
      `15:${process.cwd()}/test/resources/header/dir2/dir2/file_15_01`,
      `16:${process.cwd()}/test/resources/header/dir2/dir1/file_16_01`
    ]
  },
  'Time': -1
};
const test = async () => {
  childProcess.execSync(`node header ./test/resources/header -s TEST`);

  const logFpath = utility.getLatestFpath('./logs', timestamp, 'header_TEST.json');
  const log = require(logFpath);

  if (Object.keys(log).length !== Object.keys(expectLog).length) {
    throw new Error(`${Object.keys(log).length}`);
  }
  if (log['Target directory'] !== expectLog['Target directory']) {
    throw new Error(`${log['Target directory']}`);
  }
  if (log['Target file count'] !== expectLog['Target file count']) {
    throw new Error(`${log['Target file count']}`);
  }
  if (log['Symbolic link count'] !== expectLog['Symbolic link count']) {
    throw new Error(`${log['Symbolic link count']}`);
  }
  const headers = Object.keys(log['Headers']);
  if (headers.length !== Object.keys(expectLog['Headers']).length) {
    throw new Error(``);
  }
  for (let hi = 0; hi < headers.length; hi++) {
    const header = headers[hi];
    const records = log['Headers'][header];
    if (records.length !== expectLog['Headers'][header].length) {
      throw new Error(``);
    }
    for (let ri = 0; ri < records.length; ri++) {
      const record = records[ri];
      if (record !== expectLog['Headers'][header][ri]) {
        console.log(header);
        console.log(record);
        console.log(expectLog['Headers'][header][ri]);
        throw new Error(``);
      }
    }
  }
  if (!(-1 < log['Time'])) {
    throw new Error(`${log['Time']}`);
  }
};

const test_n5 = async () => {
  childProcess.execSync(`node header ./test/resources/header -s TEST_N5 -n 5`);

  const logFpath = utility.getLatestFpath('./logs', timestamp, 'header_TEST_N5.json');
  const log = require(logFpath);

  if (Object.keys(log).length !== Object.keys(expectLogN5).length) {
    throw new Error(`${Object.keys(log).length}`);
  }
  if (log['Target directory'] !== expectLogN5['Target directory']) {
    throw new Error(`${log['Target directory']}`);
  }
  if (log['Target file count'] !== expectLogN5['Target file count']) {
    throw new Error(`${log['Target file count']}`);
  }
  if (log['Symbolic link count'] !== expectLogN5['Symbolic link count']) {
    throw new Error(`${log['Symbolic link count']}`);
  }
  const headers = Object.keys(log['Headers']);
  if (headers.length !== Object.keys(expectLogN5['Headers']).length) {
    throw new Error(``);
  }
  for (let hi = 0; hi < headers.length; hi++) {
    const header = headers[hi];
    const records = log['Headers'][header];
    if (records.length !== expectLogN5['Headers'][header].length) {
      throw new Error(``);
    }
    for (let ri = 0; ri < records.length; ri++) {
      const record = records[ri];
      if (record !== expectLogN5['Headers'][header][ri]) {
        console.log(header);
        console.log(record);
        console.log(expectLogN5['Headers'][header][ri]);
        throw new Error(``);
      }
    }
  }
  if (!(-1 < log['Time'])) {
    throw new Error(`${log['Time']}`);
  }
};

const test_n15 = async () => {
  childProcess.execSync(`node header ./test/resources/header -s TEST_N15 -n 15`);

  const logFpath = utility.getLatestFpath('./logs', timestamp, 'header_TEST_N15.json');
  const log = require(logFpath);

  if (Object.keys(log).length !== Object.keys(expectLogN15).length) {
    throw new Error(`${Object.keys(log).length}`);
  }
  if (log['Target directory'] !== expectLogN15['Target directory']) {
    throw new Error(`${log['Target directory']}`);
  }
  if (log['Target file count'] !== expectLogN15['Target file count']) {
    throw new Error(`${log['Target file count']}`);
  }
  if (log['Symbolic link count'] !== expectLogN15['Symbolic link count']) {
    throw new Error(`${log['Symbolic link count']}`);
  }
  const headers = Object.keys(log['Headers']);
  if (headers.length !== Object.keys(expectLogN15['Headers']).length) {
    throw new Error(``);
  }
  for (let hi = 0; hi < headers.length; hi++) {
    const header = headers[hi];
    const records = log['Headers'][header];
    if (records.length !== expectLogN15['Headers'][header].length) {
      throw new Error(``);
    }
    for (let ri = 0; ri < records.length; ri++) {
      const record = records[ri];
      if (record !== expectLogN15['Headers'][header][ri]) {
        console.log(header);
        console.log(record);
        console.log(expectLogN15['Headers'][header][ri]);
        throw new Error(``);
      }
    }
  }
  if (!(-1 < log['Time'])) {
    throw new Error(`${log['Time']}`);
  }
};

const main = async () => {
  await test();
  await test_n5();
  await test_n15();
};

main().
catch(e => console.error(e.stack)).
finally(() => console.log('End'));
