const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);
let execId = `${timestamp}_extension_`;
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

  // node extension ${dir_path} -s ${sign} ${-F}
  const [ , , testTargetDpath, ...options ] = process.argv;

  const targetDpath = path.resolve(testTargetDpath);
  if (!fs.existsSync(targetDpath) || !fs.lstatSync(targetDpath).isDirectory()) {
    throw new Error(`Not directory. "${targetDpath}"`);
  }
  info['Target directory'] = targetDpath;

  const isForced = options.includes('-F');
  info['Forced'] = isForced;

  const sign = utility.getOptionValue('-s', options);
  execId += (sign !== undefined && sign !== null && sign !== '') ?
    sign : path.basename(targetDpath).toUpperCase();

  const execIdDpath = path.resolve('./extra', `${execId}`);
  if (fs.existsSync(execIdDpath)) {
    throw new Error(`Sorry, can not create. "${execIdDpath}"`);
  }
  info['Extra directory'] = isForced ? execIdDpath : null;
  if (isForced) {
    fs.mkdirSync(execIdDpath);
  }

  const extMap = new Map();
  const setExtMap = (type, paths) => {
    for (let i = 0; i < paths.length; i++) {
      const testPath = paths[i];
      const testExt = utility.getExtension(path.basename(testPath));
      const ext = (testExt === undefined || testExt === null) ? 'ext_none.d' :
        (testExt === '') ? 'ext_zero.d' :
        testExt.toUpperCase();
      if (!extMap.has(ext)) {
        extMap.set(ext, []);
      }
      const record = `${type}:${testPath}`;
      extMap.get(ext).push(record);
    }
  };
  const allSlpaths = utility.getSymbolicLinkPaths(targetDpath);
  info['Target symbolic link count'] = allSlpaths.length;
  setExtMap('0', allSlpaths);
  const allFpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = allFpaths.length;
  setExtMap('1', allFpaths);

  for (const [ ext, records ] of extMap) {
    let sli = 0, fi = 0;
    const digitCount = (records.length - 1).toString().length;
    const pairs = records.
      map(record => {
        const [ type, testPath ] = record.split(':');
        const btime = utility.getTimestamp(fs.lstatSync(testPath).birthtimeMs);
        return `${type}:${btime}:${testPath}`;
      }).
      sort().
      map(record => {
        const [ type, btime, testPath ] = record.split(':');
        const i = (type === '0') ? (sli++) : (fi++);
        const no = i.toString().padStart(digitCount, '0');
        const newName = utility.getFormattedName(path.basename(testPath), `${type}${no}`, btime);
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
  console.log(`End. Time: ${Date.now() - startTime}`)
});
