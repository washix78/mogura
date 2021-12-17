const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);
let execId = `${timestamp}_header_`;
const info = {
  'Target directory': null,
  'Target file count': null,
  'Target symbolic link count': null,
  'Headers': {},
  'Time': -1
};

const main = async () => {
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
  }
  if (!fs.existsSync('./extra')) {
    fs.mkdirSync('./extra');
  }

  // node header ${dir_path} -s ${sign} -n ${byte_count}
  const [ , , testTargetDpath, ...options ] = process.argv;

  const targetDpath = path.resolve(testTargetDpath);
  if (!fs.existsSync(targetDpath) || !fs.lstatSync(targetDpath).isDirectory()) {
    throw new Error(`Not directory. "${targetDpath}"`);
  }
  info['Target directory'] = targetDpath;

  const sign = utility.getOptionValue('-s', options);
  execId += (sign !== undefined && sign !== null && sign !== '') ?
    sign : path.basename(targetDpath).toUpperCase();

  const testMaxByteCount = utility.getOptionValue('-n', options);
  const maxByteCount = (
    testMaxByteCount !== undefined &&
    testMaxByteCount !== null &&
    /^[1-9][0-9]*$/.test(testMaxByteCount)
  ) ? parseInt(testMaxByteCount, 10) : 10;

  info['Target symbolic link count'] = utility.getSymbolicLinkPaths(targetDpath).length;

  const headerMap = new Map();
  const getHeader = (testPath) => {
    const fd = fs.openSync(testPath);
    let header = '';
    try {
      const buf = Buffer.alloc(maxByteCount);
      const count = fs.readSync(fd, buf, 0, buf.length, 0);
      for (let i = 0; i < count; i++) {
        const b = buf[i];
        header += (b.toString(16).padStart(2, '0'));
      }
    } finally {
      fs.closeSync(fd);
    }
    return header;
  };
  const fpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = fpaths.length;
  for (let i = 0; i < fpaths.length; i++) {
    const testPath = fpaths[i];
    const header = getHeader(testPath);
    if (!headerMap.has(header)) {
      headerMap.set(header, []);
    }
    const size = fs.lstatSync(testPath).size.toString(10);
    const omittedPath = utility.omitPath(testPath, targetDpath);
    const record = `${size}:${omittedPath}`;
    headerMap.get(header).push(record);
  }

  Array.from(headerMap.keys()).
    sort((a, b) => {
      if (a.length === b.length) {
        return a.localeCompare(b);
      } else {
        return a.length - b.length;
      }
    }).
    forEach(header => info['Headers'][header] = null);
  for (const [ header, records ] of headerMap) {
    const newRecords = records.
      sort((a, b) => {
        const sizea = a.split(':')[0];
        const sizeb = b.split(':')[0];
        if (sizea.length === sizeb.length) {
          return sizea.localeCompare(sizeb);
        } else {
          return sizea.length - sizeb.length;
        }
      });
    info['Headers'][header] = newRecords;
  }
};

main().
catch(e => console.error(e.stack)).
finally(() => {
  info['Time'] = Date.now() - startTime;
  const logFpath = path.resolve('./logs', `${execId}.json`);
  fs.writeFileSync(logFpath, JSON.stringify(info, null, 2));
  console.log(`End. Time: ${Date.now() - startTime}`);
});
