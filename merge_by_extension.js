const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);
let execId = null;
const info = {
  'Base directory': null,
  'Base file count': null,
  'Base symbolic link count': null,
  'Target directory': null,
  'Target file count': null,
  'Target symbolic link count': null,
  'Forced': null,
  'Extra directory': null,
  'Records': [],
  'Time': -1
};

const main = async () => {
  // node merge_by_extension ${dir_path} ${dir_path} -s ${sign} ${-F}
  const [ , , testBaseDpath, testTargetDpath, ...options ] = process.argv;

  const baseDpath = path.resolve(testBaseDpath);
  if (!fs.existsSync(baseDpath) || !fs.lstatSync(baseDpath).isDirectory()) {
    throw new Error(`Not directory. "${baseDpath}"`);
  }
  const targetDpath = path.resolve(testTargetDpath);
  if (!fs.existsSync(targetDpath) || !fs.lstatSync(targetDpath).isDirectory()) {
    throw new Error(`Not directory. "${targetDpath}"`);
  }

  const isForced = options.includes('-F');

  const sign = utility.getOptionValue('-s', options);
  execId = (sign === undefined || sign === null || sign === '') ?
    `${timestamp}_merge_by_extension` : `${timestamp}_merge_by_extension_${sign}`;

  const execIdDpath = path.resolve('./extra', `${execId}`);
  if (fs.existsSync(execIdDpath)) {
    throw new Error(`Sorry, can not create. "${execIdDpath}"`);
  }
  if (isForced) {
    fs.mkdirSync(execIdDpath);
  }

  const extMap = new Map();
  const setExtMap = (type, paths) => {
    for (let i = 0; i < paths.length; i++) {
      const testPath = paths[i];
      const testExt = utility.getExtension(path.basename(testPath));
      const ext = (testExt === undefined || testExt === null) ? 'ext_none' :
        (testExt === '') ? 'ext_zero' :
        testExt.toUpperCase();
      if (!extMap.has(ext)) {
        extMap.set(ext, []);
      }
      const record = `${type}:${testPath}`;
      extMap.get(ext).push(record);
    }
  };
  const baseSlpaths = utility.getSymbolicLinkPaths(baseDpath);
  info['Base symbolic link count'] = baseSlpaths.length;
  setExtMap('00', baseSlpaths);
  const baseFpaths = utility.getFilePaths(baseDpath);
  info['Base file count'] = baseFpaths.length;
  setExtMap('01', baseFpaths);
  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath);
  info['Target symbolic link count'] = targetSlpaths.length;
  setExtMap('10', targetSlpaths);
  const targetFpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = targetFpaths.length;
  setExtMap('11', targetFpaths);

  for (const [ ext, records ] of extMap) {
    const digitCount = (records.length - 1).toString().length;
    const pairs = records.
      map(record => {
        const [ type, testPath ] = record.split(':');
        const btime = fs.lstatSync(testPath).birthtimeMs;
        return `${type}:${utility.getTimestamp(btime)}:${testPath}`;
      }).
      sort().
      map((record, i) => {
        const [ type, btime, testPath ] = record.split(':');
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
        fs.renameSync(newPath, testPath);
      }
      const omittedNewPath = utility.omitPath(newPath, execIdDpath);
      const parentDpath = newName.startsWith('0') ? baseDpath : targetDpath;
      const omittedOldPath = utility.omitPath(testPath, parentDpath);
      info['Records'].push(`${omittedNewPath}:${omittedOldPath}`);
    }
  }

  const extraBaseDpath = path.resolve(execIdDpath, 'extra_base.d');
  if (isForced) {
    fs.mkdirSync(extraBaseDpath);
    fs.readdirSync(baseDpath).forEach(name => {
      const oldPath = path.resolve(baseDpath, name);
      const newPath = path.resolve(extraBaseDpath, name);
      fs.renameSync(oldPath, newPath);
    });
  }

  for (const [ ext, _paths ] of extMap) {
    const oldPath = path.resolve(execIdDpath, ext);
    const newPath = path.resolve(baseDpath, ext);
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
