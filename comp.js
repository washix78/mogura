const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);
let execId = `${timestamp}_comp_`;
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
  'Time': null
};

const main = async () => {
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
  }
  if (!fs.existsSync('./extra')) {
    fs.mkdirSync('./extra');
  }

  // node comp ${dir_path} ${dir_path} -s ${sign} ${-F}
  const [ , , testBaseDpath, testTargetDpath, ...options ] = process.argv;

  const baseDpath = path.resolve(testBaseDpath);
  if (!fs.existsSync(baseDpath) || !fs.lstatSync(baseDpath).isDirectory()) {
    throw new Error(`Not directory. "${baseDpath}"`);
  }
  const targetDpath = path.resolve(testTargetDpath);
  if (!fs.existsSync(targetDpath) || !fs.lstatSync(targetDpath).isDirectory()) {
    throw new Error(`Not directory. "${targetDpath}"`);
  }
  if (baseDpath === targetDpath) {
    throw new Error(`Same directories.`);
  }
  info['Base directory'] = baseDpath;
  info['Target directory'] = targetDpath;

  const isForced = options.includes('-F');
  info['Forced'] = isForced;

  const sign = utility.getOptionValue('-s', options);
  execId += (sign !== undefined && sign !== null && sign !== '') ?
    sign : `${path.basename(baseDpath).toUpperCase()}_${path.basename(targetDpath).toUpperCase()}`;

  const execIdDpath = path.resolve('./extra', `${execId}`);
  if (fs.existsSync(execIdDpath)) {
    throw new Error(`Sorry, can not create. "${execIdDpath}"`);
  }
  info['Extra directory'] = isForced ? execIdDpath : null;
  if (isForced) {
    fs.mkdirSync(execIdDpath);
  }

  const digestMap = new Map();

  const baseFpaths = utility.getFilePaths(baseDpath);
  info['Base file count'] = baseFpaths.length;
  for (let i = 0; i < baseFpaths.length; i++) {
    const testPath = baseFpaths[i];
    const digest1 = await utility.getFileDigest(testPath, 'md5');
    const digest2 = await utility.getFileDigest(testPath, 'sha1');
    const digest = `${digest1}_${digest2}`;
    if (!digestMap.has(digest)) {
      digestMap.set(digest, []);
    }
    const record = `0:${testPath}`;
    digestMap.get(digest).push(record);
  }

  const targetFpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = targetFpaths.length;
  for (let i = 0; i < targetFpaths.length; i++) {
    const testPath = targetFpaths[i];
    const digest1 = await utility.getFileDigest(testPath, 'md5');
    const digest2 = await utility.getFileDigest(testPath, 'sha1');
    const digest = `${digest1}_${digest2}`;
    if (digestMap.has(digest)) {
      const record = `1:${testPath}`;
      digestMap.get(digest).push(record);
    }
  }

  const move = (digest, records) => {
    const digitCount = (records.length - 1).toString().length;
    const pairs = records.map(record => {
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

    const digestDpath = path.resolve(execIdDpath, digest);
    if (isForced) {
      fs.mkdirSync(digestDpath);
    }
    for (let i = 0; i < pairs.length; i++) {
      const [ newName, testPath ] = pairs[i];
      const newPath = path.resolve(digestDpath, newName);
      if (isForced) {
        if (newName.startsWith('0')) {
          fs.symlinkSync(testPath, newPath);
        } else {
          fs.renameSync(testPath, newPath);
        }
      }
      const omittedNew = utility.omitPath(newPath, execIdDpath);
      const omittedOld = utility.omitPath(testPath, targetDpath);
      info['Records'].push(`${omittedNew}:${omittedOld}`);
    }
  };

  for (const [ digest, records ] of digestMap) {
    if (records.some(record => record.startsWith('1'))) {
      move(digest, records);
    }
  }

  const baseSlpaths = utility.getSymbolicLinkPaths(baseDpath);
  info['Base symbolic link count'] = baseSlpaths.length;

  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath);
  info['Target symbolic link count'] = targetSlpaths.length;
  const targetSlrecords = targetSlpaths.map(testPath => `1:${testPath}`);
  move('syml.d', targetSlrecords);
};

main().
catch(e => console.error(e.stack)).
finally(() => {
  info['Time'] = Date.now() - startTime;
  const logFpath = path.resolve('./logs', `${execId}.json`);
  fs.writeFileSync(logFpath, JSON.stringify(info, null, 2));
  console.log(`End. Time: ${Date.now() - startTime}`);
});
