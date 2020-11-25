const fs = require('fs');
const utility = require('../utility');


const testResourceBase = './test/resources/utility';

const testGetTimestamp = async () => {
  const timestamp = utility.getTimestamp();
  if (timestamp.length !== 'yyyymmddhhmmssSSS'.length) {
    throw new Error('testGetTimestamp');
  }

  const srcDate = new Date();
  const timestamp2 = utility.getTimestamp(srcDate);
  if (timestamp2.length !== 'yyyymmddhhmmssSSS'.length) {
    throw new Error('testGetTimestamp: srcDate');
  }
};

const testGetExtension = async () => {
  const expected = [
    null,
    null,
    null,
    '',
    'b',
  ];
  const actual = [
    utility.getExtension(),
    utility.getExtension(''),
    utility.getExtension('a'),
    utility.getExtension('a.'),
    utility.getExtension('a.b'),
  ];
  expected.forEach((exp, i) => {
    if (exp !== actual[i]) {
      throw new Error('testGetExtension');
    }
  });
};

const testGetOptionValue = async () => {
  const expected = [
    null, null, 'a'
  ];
  const actual = [
    utility.getOptionValue('-t', []),
    utility.getOptionValue('-t', [ 'T', '-t' ]),
    utility.getOptionValue('-t', [ 'T', '-t', 'a', 'b' ]),
  ];
  expected.forEach((exp, i) => {
    if (exp !== actual[i]) {
      throw new Error('testGetOptionValue');
    }
  });
};

const testGetOptionValues = async () => {
  const expected = [
    null,
    null,
    [],
    [ 'a', 'b' ],
    [],
    [ 'b', 'c' ],
    [],
  ];
  const actual = [
    utility.getOptionValues('-t', []),
    utility.getOptionValues('-t', [ 'T' ]),
    utility.getOptionValues('-t', [ '-t' ]),
    utility.getOptionValues('-t', [ '-t', 'a', 'b' ]),
    utility.getOptionValues('-t', [ 'a', '-t' ]),
    utility.getOptionValues('-t', [ 'a', '-t', 'b', 'c', '-e' ]),
    utility.getOptionValues('-t', [ '-t', '-u' ]),
  ];
  expected.forEach((exp, i) => {
    const act = actual[i];
    if (exp === null) {
      if (exp !== act) {
        throw new Error('testGetOptionValues: exp !== act');
      }
    } else {
      if (exp.length !== act.length) {
        throw new Error('testGetOptionValues: exp.length !== act.length');
      }
      for (let ei = 0; ei < exp.length; ei++) {
        if (exp[ei] !== act[ei]) {
          throw new Error('testGetOptionValues: exp[ei] !== act[ei]');
        }
      }
    }
  });
};

const testGetFileWriter = async () => {
  const outputPath = './logs/actual_test_get_file_writer.txt';
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  const writer = utility.getFileWriter(outputPath);
  writer.write('1');
  writer.write([ '2', '3' ]);
  await writer.end();
  const expectFpath = `${testResourceBase}/expect_test_get_file_writer.txt`;
  const a = fs.readFileSync(expectFpath, 'utf8');
  const b = fs.readFileSync(outputPath, 'utf8');

  if (a !== b) {
    throw new Error('testGetFileWriter');
  }
};

const testGetLinesFromFile = async () => {
  const srcFpath = `${testResourceBase}/src_test_get_lines_from_file.txt`;

  utility.getLinesFromFile(srcFpath).then(lines => {
    const a = [ '1', '2', '3', '4', '5' ];
    lines.forEach((line, i) => {
      if (line !== a[i]) {
        throw new Error('testGetLinesFromFile');
      }
    });
  });
};

const testConvertByte = async () => {
  const expect = [
    null,
    null,
    1,
    1024,
    Math.pow(1024, 2),
    Math.pow(1024, 3),
  ];
  const actual = [
    utility.convertByte('0test'),
    utility.convertByte('-1'),
    utility.convertByte('1'),
    utility.convertByte('1k'),
    utility.convertByte('1m'),
    utility.convertByte('1g'),
  ];
  expect.forEach((exp, i) => {
    if (exp !== actual[i]) {
      throw new Error('testConvertByte');
    }
  });
};

const testGetFileDigest = async () => {
  const testFpath = `${testResourceBase}/src_test_get_file_digest.txt`;
  const expect = '7c12772809c1c0c3deda6103b10fdfa0';
  const digest = await utility.getFileDigest(testFpath, 'md5');
  if (expect !== digest) {
    throw new Error('testGetFileDigest');
  }

  const expect2 = '12039d6dd9a7e27622301e935b6eefc78846802e';
  const digest2 = await utility.getFileDigest(testFpath, 'sha1');
  if (expect2 !== digest2) {
    throw new Error('testGetFileDigest: expect2 !== digest2');
  }
};

const testGetTvsFileWriter = async () => {
  const outputPath = './logs/actual_test_get_tvs_file_writer.txt';
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  const writer = utility.getTvsFileWriter(outputPath);
  writer.write();
  writer.write([]);
  writer.write('a', 'b');
  writer.write([ 'c', 'd' ]);
  writer.write('e', 'f', [ 'g', 'h' ], 'i', 'j');
  writer.write(null, undefined, [ null, undefined ]);
  writer.write(1, [ '2' ]);
  await writer.end();

  const expectFpath = `${testResourceBase}/expect_test_get_tvs_file_writer.txt`;
  const a = fs.readFileSync(expectFpath, 'utf8');
  const b = fs.readFileSync(outputPath, 'utf8');
  if (a !== b) {
    throw new Error('testGetTvsFileWriter');
  }
};

const test = async () => {
  try {
    await testGetTimestamp();
    await testGetExtension();
    await testGetOptionValue();
    await testGetOptionValues();
    // walkDir
    await testGetFileWriter();
    await testGetLinesFromFile();
    await testConvertByte();
    await testGetFileDigest();
    await testGetTvsFileWriter();

    console.log('Succeeded.');
  } catch (e) {

    console.error('Failed.')
    console.error(e.stack);
  }
};
test();
