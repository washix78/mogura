const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);
let execId = `${timestamp}_image_`;
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

  // node image ${dir_path} -s ${sign} -F
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

  const extMap = new Map();
  [ 'BMP', 'GIF', 'JPG', 'PNG', 'binary.d' ].forEach(ext => extMap.set(ext, []));
  const fpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = fpaths.length;
  for (let i = 0; i < fpaths.length; i++) {
    const testPath = fpaths[i];
    const ext = utility.getImageType(testPath);
    extMap.get(ext).push(testPath);
  }

  info['Target symbolic link count'] = utility.getSymbolicLinkPaths(targetDpath).length;

  if (isForced) {
    fs.mkdirSync(execIdDpath);
  }
  for (const [ ext, records ] of extMap) {
    if (0 === records.length) {
      continue;
    }

    const digitCount = (records.length - 1).toString().length;
    const pairs = records.
      map(testPath => {
        const btime = utility.getTimestamp(fs.lstatSync(testPath).birthtimeMs);
        return `${btime}:${testPath}`;
      }).
      sort().
      map((record, i) => {
        const [ btime, testPath ] = record.split(':');
        const no = i.toString().padStart(digitCount, '0');
        const newName = (ext === 'binary.d') ?
          utility.getFormattedName(path.basename(testPath), no, btime) :
          utility.getFormattedNameWithExtension(path.basename(testPath), no, btime, ext.toLowerCase());
        return [ newName, testPath ];
      });

    const extDpath = path.resolve(execIdDpath, ext);
    if (isForced) {
      fs.mkdirSync(extDpath);
    }
    for (let i = 0; i < pairs.length; i++) {
      const [ newName, testPath ] = pairs[i];
      const newPath = path.resolve(extDpath, newName);
      if (isForced) {
        fs.renameSync(testPath, newPath);
      }
      const omittedNew = utility.omitPath(newPath, execIdDpath);
      const omittedOld = utility.omitPath(testPath, targetDpath);
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

  for (const ext of extMap.keys()) {
    const oldPath = path.resolve(execIdDpath, ext);
    const newPath = path.resolve(targetDpath, ext);
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
