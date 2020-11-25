const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const main = async () => {
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
    let marker = utility.getOptionValue('-m', options);
    if (marker === null) {
      marker = utility.getTimestamp();
    }
    const outputPath = `./logs/ext-${marker}.txt`;

    if (fs.existsSync(outputPath)) {
      throw new Error(`"${outputPath}" exists.`);
    }

    // name
    const nameMap = new Map();
    const nameAfter = (_, fnames) => {
      fnames.
        filter(fname => !fname.includes('.')).
        forEach(fname => {
          if (!nameMap.has(fname)) {
            nameMap.set(fname, 0);
          }
          const count = nameMap.get(fname) + 1;
          nameMap.set(fname, count);
        });
    };
    // extension
    const extensionMap = new Map();
    const extensionAfter = (_, fnames) => {
      fnames.
        filter(fname => fname.includes('.')).
        map(fname => utility.getExtension(fname)).
        forEach(ext => {
          if (!extensionMap.has(ext)) {
            extensionMap.set(ext, 0);
          }
          const count = extensionMap.get(ext) + 1;
          extensionMap.set(ext, count);
        });
    };

    if (onlyFname) {
      utility.walkDir(targetDpath, nameAfter);
    } else {
      utility.walkDir(targetDpath, extensionAfter);
    }

    const writer = utility.getTvsFileWriter(outputPath);

    const map = (onlyFname) ? nameMap : extensionMap;
    const keys = Array.from(map.keys()).sort((a, b) => a > b);
    keys.forEach(key => {
      const line = [ key, map.get(key) ];
      writer.write(line);
    });

    await writer.end();
  } catch (e) {
    console.error(e.stack);
  } finally {
    const endTime = Date.now();
    const time = endTime - startTime;
    console.log(`Time: ${time}`);
  }
};
main();
