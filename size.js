const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const utility = require('./utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);
let execId = `${timestamp}_size_`;
const info = {
  'Target directory': null,
  'Target file count': null,
  'Target symbolic link count': null,
  'Forced': null,
  'Extra directory': null,
  'Records': [],
  'Time': -1
};

const main = async () => {
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
  }
  if (!fs.existsSync('./extra')) {
    fs.mkdirSync('./extra');
  }

  // node size ${dir_path} -s ${sign} -F
  const [ , , testTargetDpath, ...options ] = process.argv;

  const targetDpath = path.resolve(testTargetDpath);
  if (!fs.existsSync(targetDpath) || !fs.lstatSync(targetDpath).isDirectory()) {
    throw new Error(`Not directory. "${targetDpath}"`);
  }
  info['Target directory'] = targetDpath;

  const sign = utility.getOptionValue('-s', options);
  execId += (sign !== undefined && sign !== null && sign !== '') ?
    sign : path.basename(targetDpath).toUpperCase();

  const isForced = options.includes('-F');
  info['Forced'] = isForced;

  const execIdDpath = path.resolve('./extra', execId);
  info['Extra directory'] = (isForced) ? execIdDpath : null;

  info['Target symbolic link count'] = utility.getSymbolicLinkPaths(targetDpath).length;

  const sizeMap = new Map();
  const fpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = fpaths.length;
  const getSize = (testPath) => {
    return new Promise((resolve, _reject) => {
      sizeOf(testPath, (err, dimensions) => {
        if (err) {
          resolve([ -1, -1 ]);
        } else {
          resolve([ dimensions.width, dimensions.height ]);
        }
      });
    });
  };
  for (let i = 0; i < fpaths.length; i++) {
    const testPath = fpaths[i];
    const [ w, h ] = await getSize(testPath);
    const size = (w === -1 || h === -1) ? 'other.d' :
      (h <= w) ? `${w}_${h}` : `${h}_${w}`;
    if (!sizeMap.has(size)) {
      sizeMap.set(size, []);
    }
    const btime = utility.getTimestamp(fs.lstatSync(testPath).birthtimeMs);
    const omittedOld = utility.omitPath(testPath, targetDpath);
    const record = `${size}:${btime}:${omittedOld}`;
    sizeMap.get(size).push(record);
  }

  if (isForced) {
    fs.mkdirSync(execIdDpath);
  }
  const sizeList = Array.from(sizeMap.keys()).sort((a, b) => {
    const regExp = /^\d+_\d+$/;
    if (regExp.test(a) && regExp.test(b)) {
      const [ aw, ah ] = a.split('_').map(item => parseInt(item, 10));
      const [ bw, bh ] = b.split('_').map(item => parseInt(item, 10));
      if (aw === bw) {
        return ah - bh;
      } else {
        return aw - bw;
      }
    } else {
      return a.localeCompare(b);
    }
  });
  for (const size of sizeList) {
    const records = sizeMap.get(size);
    const digitCount = (records.length - 1).toString().length;
    const pairs = records.
      sort().
      map((record, i) => {
        const [ _wh, btime, omittedOld ] = record.split(':');
        const no = i.toString().padStart(digitCount, '0');
        const newName = utility.getFormattedName(path.basename(omittedOld), no, btime);
        return [ newName, omittedOld ];
      });

    const sizeDpath = path.resolve(execIdDpath, size);
    if (isForced) {
      fs.mkdirSync(sizeDpath);
    }
    for (let i = 0; i < pairs.length; i++) {
      const [ newName, omittedOld ] = pairs[i];
      const oldPath = path.resolve(targetDpath, omittedOld);
      const newPath = path.resolve(sizeDpath, newName);
      if (isForced) {
        fs.renameSync(oldPath, newPath);
      }
      const omittedNew = utility.omitPath(newPath, execIdDpath);
      info['Records'].push(`${omittedNew}:${omittedOld}`);
    }
  }

  const extraDpath = path.resolve(execIdDpath, 'extra.d');
  if (isForced) {
    fs.mkdirSync(extraDpath);
    fs.readdirSync(targetDpath).forEach(name => {
      const newPath = path.resolve(extraDpath, name);
      const oldPath = path.resolve(targetDpath, name);
      fs.renameSync(oldPath, newPath);
    });
  }

  for (const size of sizeMap.keys()) {
    const oldPath = path.resolve(execIdDpath, size);
    const newPath = path.resolve(targetDpath, size);
    if (isForced) {
      fs.renameSync(oldPath, newPath);
    }
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
