const fs = require('fs-extra');
const path = require('path');
const utility = require('../utility');

const testEqualsArray = async () => {
  const pairs = [
    [ utility.equalsArray([], []), true ],
    [ utility.equalsArray([ 0, 'a' ], [ 0, 'a' ]), true ],
    [ utility.equalsArray([ 0, 'a' ], [ 0, 'a', 1 ]), false ],
    [ utility.equalsArray([ 0, 'a', 1 ], [ 0, 'a' ]), false ],
    [ utility.equalsArray([ 0, 'a' ], [ 'a', 0 ]), false ]
  ];

  for (let i = 0; i < pairs.length; i++) {
    const [ actual, expect ] = pairs[i];
    if (expect !== actual) {
      throw new Error(``);
    }
  }
};

const testGenerateResourceFiles = async () => {
  // TODO
};

const testGenerateResourceSymbolicLinks = async () => {
  // TODO
};

const testGetAllPaths = async (baseDpath) => {
  const expectPaths = [
    'dir1',
    'dir2',
    'file0',
    'file1',
    'dir1/file2',
    'dir1/file3',
    'dir2/dir1',
    'dir2/dir2',
    'dir2/file4',
    'dir2/file5',
    'dir2/dir1/file6',
    'dir2/dir1/file7',
    'dir2/dir1/syml1',
    'dir2/dir2/file8',
    'dir2/dir2/file9',
    'dir2/dir2/syml0'
  ].map(testPath => path.resolve(baseDpath, testPath));
  const allPaths = utility.getAllPaths(baseDpath);
  if (allPaths.length !== expectPaths.length) {
    throw new Error(`${allPaths.length}`);
  }
  for (let i = 0; i < allPaths.length; i++) {
    if (allPaths[i] !== expectPaths[i]) {
      throw new Error();
    }
  }
};

const testGetDirectoryPaths = async (baseDpath) => {
  const expectPaths = [
    `dir1`,
    `dir2`,
    `dir2/dir1`,
    `dir2/dir2`
  ].map(testPath => path.resolve(baseDpath, testPath));
  const allPaths = utility.getDirectoryPaths(baseDpath);
  if (allPaths.length !== expectPaths.length) {
    throw new Error(`${allPaths.length}`);
  }
  for (let i = 0; i < allPaths.length; i++) {
    if (allPaths[i] !== expectPaths[i]) {
      throw new Error();
    }
  }
};

const testGetFilePaths = async (baseDpath) => {
  const expectPaths = [
    'file0',
    'file1',
    'dir1/file2',
    'dir1/file3',
    'dir2/file4',
    'dir2/file5',
    'dir2/dir1/file6',
    'dir2/dir1/file7',
    'dir2/dir2/file8',
    'dir2/dir2/file9'
  ].map(testPath => path.resolve(baseDpath, testPath));
  const allPaths = utility.getFilePaths(baseDpath);
  if (allPaths.length !== expectPaths.length) {
    throw new Error(`${allPaths.length}`);
  }
  for (let i = 0; i < allPaths.length; i++) {
    if (allPaths[i] !== expectPaths[i]) {
      throw new Error();
    }
  }
};

const testGetSymblicLinkPaths = async (baseDpath) => {
  const expectPaths = [
    'dir2/dir1/syml1',
    'dir2/dir2/syml0'
  ].map(testPath => path.resolve(baseDpath, testPath));
  const allPaths = utility.getSymbolicLinkPaths(baseDpath);
  if (allPaths.length !== expectPaths.length) {
    throw new Error(`${allPaths.length}`);
  }
  for (let i = 0; i < allPaths.length; i++) {
    if (allPaths[i] !== expectPaths[i]) {
      throw new Error();
    }
  }
};

const testGetPaths = async () => {
  const baseDpath = path.resolve(process.cwd(), 'testwork/utility_get_paths');
  fs.emptyDirSync(baseDpath);
  const resourceFpaths = [
    'file0:file0',
    'file1:file1',
    'file2:dir1/file2',
    'file3:dir1/file3',
    'file4:dir2/file4',
    'file5:dir2/file5',
    'file6:dir2/dir1/file6',
    'file7:dir2/dir1/file7',
    'file8:dir2/dir2/file8',
    'file9:dir2/dir2/file9'
  ];
  utility.generateResourceFiles(baseDpath, resourceFpaths);
  const resourceSlpaths = [
    'file1:dir2/dir1/syml1',
    'file0:dir2/dir2/syml0'
  ];
  utility.generateResourceSymbolicLinks(baseDpath, resourceSlpaths);

  await testGetAllPaths(baseDpath);
  await testGetDirectoryPaths(baseDpath);
  await testGetFilePaths(baseDpath);
  await testGetSymblicLinkPaths(baseDpath);
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

const testGetFileDigest = async () => {
  const testFpath = './test/resources/file0';
  const expect = '3749f52bb326ae96782b42dc0a97b4c1';
  const digest = await utility.getFileDigest(testFpath, 'md5');
  if (expect !== digest) {
    throw new Error('testGetFileDigest');
  }

  const expect2 = '3a30948f8cd5655fede389d73b5fecd91251df4a';
  const digest2 = await utility.getFileDigest(testFpath, 'sha1');
  if (expect2 !== digest2) {
    throw new Error('testGetFileDigest: expect2 !== digest2');
  }
};

const testGetFormattedName = async () => {
  const src = [
    'file',
    'file.txt',
    '99_12345678901234567-file',
    '99_12345678901234567-file.txt',
    '00_12345678901234567-00_12345678901234567-file'
  ];
  const expect = [
    '007_76543210987654321-file',
    '007_76543210987654321-file.txt',
    '007_76543210987654321-file',
    '007_76543210987654321-file.txt',
    '007_76543210987654321-00_12345678901234567-file'
  ];
  for (let i = 0; i < src.length; i++) {
    const actual = utility.getFormattedName(src[i], '007', '76543210987654321');
    if (expect[i] !== actual) {
      throw new Error(`${expect[i]} !== ${actual}`);
    }
  }
};

const testGetFormattedNameWithExtension = async () => {
  const src = [
    'name',
    'name.',
    'name.x',
    'name.txt.x',
    '99_76543210987654321-name',
    '99_76543210987654321-name.',
    '99_76543210987654321-name.x',
    '99_76543210987654321-9_76543210987654321-name',
    '99_76543210987654321-',
    '99_76543210987654321-.',
    '99_76543210987654321-.x',
  ];
  const expect = [
    '777_12345678901234567-name.txt',
    '777_12345678901234567-name.txt',
    '777_12345678901234567-name.txt',
    '777_12345678901234567-name.txt.txt',
    '777_12345678901234567-name.txt',
    '777_12345678901234567-name.txt',
    '777_12345678901234567-name.txt',
    '777_12345678901234567-9_76543210987654321-name.txt',
    '777_12345678901234567-.txt',
    '777_12345678901234567-.txt',
    '777_12345678901234567-.txt'
  ];
  for (let i = 0; i < src.length; i++) {
    const actual = utility.getFormattedNameWithExtension(src[i], '777', '12345678901234567', 'txt');
    if (actual !== expect[i]) {
      throw new Error(`${i}: ${actual} !== ${expect[i]}`);
    }
  }
};

const testGetImageType = async () => {
  const expectList = [
    'binary.d',
    'BMP',
    'GIF',
    'GIF',
    'JPG',
    'PNG'
  ];
  const actualList = [
    utility.getImageType('./test/resources/utility_get_image_type/file'),
    utility.getImageType('./test/resources/utility_get_image_type/file_bmp'),
    utility.getImageType('./test/resources/utility_get_image_type/file_gif1'),
    utility.getImageType('./test/resources/utility_get_image_type/file_gif2'),
    utility.getImageType('./test/resources/utility_get_image_type/file_jpg'),
    utility.getImageType('./test/resources/utility_get_image_type/file_png')
  ];
  if (expectList.length !== actualList.length) {
    throw new Error(``);
  }
  for (let i = 0; i < expectList.length; i++) {
    if (expectList[i] !== actualList[i]) {
      throw new Error(``);
    }
  }
};

const testGetLatestDpath = async () => {

};

const testGetLatestFpath = async () => {

};

const testGetOptionValue = async () => {
  const expected = [
    null, null, 'a', '', 'a', null,
  ];
  const actual = [
    utility.getOptionValue('-t', []),
    utility.getOptionValue('-t', [ 'T', '-t' ]),
    utility.getOptionValue('-t', [ 'T', '-t', 'a', 'b' ]),
    utility.getOptionValue('-t', [ '-t', '', 'a' ]),
    utility.getOptionValue('-t', [ '-x', '-t', 'a' ]),
    utility.getOptionValue('-x', [ '-x', '-t', 'a' ]),
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

const testGetTimestamp = async () => {
  const timestamp = utility.getTimestamp();
  if (timestamp.length !== 'yyyymmddhhmmssSSS'.length) {
    throw new Error('testGetTimestamp');
  }

  const src = Date.now();
  const timestamp2 = utility.getTimestamp(src);
  if (timestamp2.length !== 'yyyymmddhhmmssSSS'.length) {
    throw new Error('testGetTimestamp: src');
  }
};

const testOmitPath = async () => {
  const actual = utility.omitPath('/dir1/dir2/dir3/dir4/file', '/dir1/dir2');
  if ('dir3/dir4/file' !== actual) {
    throw new Error(`${actual}`);
  }
};

const test = async () => {
  await testEqualsArray();
  // await testGenerateResourceFiles();
  // await testGenerateResourceSymbolicLinks();
  await testGetPaths();
  await testGetExtension();
  await testGetFileDigest();
  await testGetFormattedName();
  await testGetFormattedNameWithExtension();
  await testGetImageType();
  // await testGetLatestDpath();
  // await testGetLatestFpath();
  await testGetOptionValue();
  await testGetOptionValues();
  await testGetTimestamp();
  await testOmitPath();
};

test().
catch(e => console.error(`Failed: ${e.stack}`)).
finally(() => console.log('End.'));
