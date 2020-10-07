const fs = require('fs');
const path = require('path');
const utility = require('./utility');

// node ext ${directory path}
// node ext ${directory path} -n
// node ext ${directory path} -m ${marker string}
// node ext ${directory path} -n -m ${marker string}
const startTime = Date.now();
try {
  const [ , , testTargetDpath, ...options ] = process.argv;
  if (!testTargetDpath || testTargetDpath.length === 0) {
    throw new Error('Specify directory path.');
  }

  const targetDpath = path.resolve(testTargetDpath);
  if (!fs.statSync(targetDpath).isDirectory()) {
    throw new Error('Specify directory path.');
  }

  const onlyFname = options.includes('-n');
  const marker = utility.getOptionValues('-m', options);

  const outputFname = (marker && 1 <= marker.length) ?
    `ext-${marker[0]}.txt` : `ext-${utility.getTimestamp()}.txt`;
  const outputPath = `./logs/${outputFname}`;

  if (fs.existsSync(outputPath)) {
    throw new Error(`"${outputPath}" exists.`);
  }

  // name
  let fnameSet = new Set();
  const nameAfter = (_, fnames) => {
    fnames.forEach(name => {
      if (!name.includes('.')) {
        fnameSet.add(name);
      }
    });
  };

  // extension
  let extensionSet = new Set();
  const extensionAfter = (_, fnames) => {
    fnames.forEach(name => {
      const extension = utility.getExtension(name);
      if (extension !== null) {
        extensionSet.add(extension);
      }
    });
  };

  if (onlyFname) {
    utility.walkDir(targetDpath, nameAfter);
  } else {
    utility.walkDir(targetDpath, extensionAfter);
  }


  const list = (onlyFname) ? Array.from(fnameSet).sort() : Array.from(extensionSet).sort();

  const writer = utility.getFileWriter(outputPath);
  list.forEach(elm => {
    console.log(elm);
    writer.write(elm);
  });
  writer.end().then();
} catch (e) {
  console.error(e.stack);
} finally {
  const endTime = Date.now();
  const time = endTime - startTime;
  console.log(`Time: ${time}`);
}
