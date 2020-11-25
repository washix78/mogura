const fs = require('fs');
const path = require('path');
const utility = require('./utility');


const main = async () => {
  const startTime = Date.now();

  try {
    const [ , , ...options ] = process.argv;

    const fromType = options.find(opt => [ '-d', '-f' ].includes(opt));
    if (fromType === undefined || fromType === null) {
      throw new Error('Not contains "-d" or "-f" option.');
    }
    const testPath = utility.getOptionValue(fromType, options);
    if (fromType === '-d') {
      if (testPath === undefined || testPath === null || !fs.statSync(testPath).isDirectory()) {
        throw new Error(`${testPath} is not directory.`);
      }
    }
    if (fromType === '-f') {
      if (testPath === undefined || testPath === null || !fs.statSync(testPath).isFile()) {
        throw new Error(`${testPath} is not file.`);
      }
    }

    let marker = utility.getOptionValue('-m', options);
    if (marker === null || marker === undefined) {
      marker = utility.getTimestamp();
    }
    const outputPath = `./logs/info-${marker}.txt`;
    if (fs.existsSync(outputPath)) {
      throw new Error(`"${outputPath}" exists.`);
    }

    const allFpaths = [];
    const ngPaths = [];
    if (fromType === '-d') {
      const targetDpath = path.resolve(testPath);
      const walkDirAfter = (topDpath, fnames) => {
        fnames.sort().forEach(fname => allFpaths.push(path.resolve(topDpath, fname)));
      };
      utility.walkDir(targetDpath, walkDirAfter);
    }
    if (fromType === '-f') {
      const lines = await utility.getLinesFromFile(testPath);
      lines.forEach(line => {
        try {
          if (fs.existsSync(line) && fs.statSync(line).isFile()) {
            allFpaths.push(line);
          } else {
            ngPaths.push(line);
          }
        } catch (_) {
          ngPaths.push(line);
        }
      });
    }

    const writer = utility.getTvsFileWriter(outputPath);

    const makeMap = async (array, keyMethod) => {
      const map = new Map();
      for (let i = 0; i < array.length; i++) {
        const elm = array[i];
        const key = await keyMethod(elm);
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key).push(elm);
      }
      return map;
    };

    const traceMap = async (array, keyMethods, orderMethods, after) => {
      const re = async (array, keyStack, mi) => {
        if (mi < keyMethods.length) {
          const map = await makeMap(array, keyMethods[mi]);
          const keys = orderMethods[mi] ? Array.from(map.keys()).sort(orderMethods[mi]) : Array.from(map.keys());
          for (let ki = 0; ki < keys.length; ki++) {
            const newKeyStack = keyStack.concat(keys[ki]);
            await re(map.get(keys[ki]), newKeyStack, mi + 1);
          }
        } else {
          await after(array, keyStack);
        }
      };
      await re(array, [], 0);
    };

    await traceMap(allFpaths, [
      fpath => fs.statSync(fpath).size,
      fpath => utility.getFileDigest(fpath, 'md5'),
      fpath => utility.getFileDigest(fpath, 'sha1'),
    ], [
      (a, b) => a - b,
      null,
      null,
    ], async (array, keyStack) => {
      // keyStack = size, md5, sha1
      const sorted = [];
      const halfRecords = [];

      await traceMap(array, [
        fpath => utility.getTimestamp(fs.statSync(fpath).birthtime),
        fpath => utility.getTimestamp(fs.statSync(fpath).mtime),
      ], [
        (a, b) => a > b,
        (a, b) => a > b,
      ], async (array, keyStack) => {
        // keyStack = birthtime, mtime
        for (let i = 0; i < array.length; i++) {
          sorted.push(array[i]);
          halfRecords.push(keyStack);
        }
      });

      for (let i = 0; i < sorted.length; i++) {
        const record = [ (0 < i) ? '#' : null ].concat(sorted[i]).concat(keyStack).concat(halfRecords[i]);
        writer.write(record);
      }
    });

    for (let i = 0; i < ngPaths.length; i++) {
      const ng = ngPaths[i];
      const line = [ '#ERR', ng ];
      writer.write(line);
    }

    await writer.end();
  } catch (e) {
    console.error(`Error: ${e.message}`);
    console.log(e.stack);
  } finally {
    const endTime = Date.now();
    const time = endTime - startTime;
    console.log(`Time: ${time}`);
  }
};
main();
