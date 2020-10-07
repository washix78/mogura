const fs = require('fs');
const utility = require('../utility');

try {
  const timestamp = utility.getTimestamp();
  if (timestamp.length === "yyyymmddhhmmssSSS".length) {
    console.log('Test succeeded.')
  } else {
    throw new Error('Test failed.');
  }
} catch (e) {
  console.error(e.stack);
}

try {
  const expected = [
    null,
    null,
    null,
    "",
    "b",
  ];
  const actual = [
    utility.getExtension(),
    utility.getExtension(""),
    utility.getExtension("a"),
    utility.getExtension("a."),
    utility.getExtension("a.b"),
  ];
  expected.forEach((exp, i) => {
    if (exp === actual[i]) {
      console.log('Test succeeded.');
    } else {
      throw new Error(`Test failed. ${exp} === ${actual[i]}`);
    }
  });
} catch (e) {
  console.error(e.stack);
}

try {
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
      if (exp === act) {
        console.log('Test succeeded.');
      } else {
        throw new Error('Test failed.');
      }
    } else {
      if (exp.length !== act.length) {
        throw new Error('Test failed.');
      }
      for (let ei = 0; ei < exp.length; ei++) {
        if (exp[ei] !== act[ei]) {
          throw new Error('Test failed.');
        }
      }
      console.log('Test succeeded.');
    }
  });
} catch (e) {
  console.error(e.stack);
}

try {
  const outputPath = './logs/test_utility_get_file_writer.txt';
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  const writer = utility.getFileWriter(outputPath);
  writer.write('1');
  writer.write([ '2', '3' ]);
  writer.end().then(() => {
    const a = fs.readFileSync('./test/utility_get_file_writer.txt', 'utf8');
    const b = fs.readFileSync(outputPath, 'utf8');

    if (a === b) {
      console.log('Test succeeded.');
    } else {
      console.log(a);
      throw new Error('Test failed.');
    }
  });
} catch (e) {
  console.error(e.stack);
}
