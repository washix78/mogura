const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);
let execId = `${timestamp}_unique_`;
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

  // node unique ${dir_path} -s ${sign} ${-F}
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

  const digestMap = new Map();
  const setDigestMap = async (paths, type) => {
    for (let i = 0; i < paths.length; i++) {
      const testPath = paths[i];
      const digest1 = await utility.getFileDigest(testPath, 'md5');
      const digest2 = await utility.getFileDigest(testPath, 'sha1');
      const digest = `${digest1}_${digest2}`;
      if (!digestMap.has(digest)) {
        digestMap.set(digest, []);
      }
      const record = `${type}:${testPath}`;
      digestMap.get(digest).push(record);
    }
  };
  const allSlpaths = utility.getSymbolicLinkPaths(targetDpath);
  info['Target symbolic link count'] = allSlpaths.length;
  await setDigestMap(allSlpaths, '0');
  const allFpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = allFpaths.length;
  await setDigestMap(allFpaths, '1');

  for (const [ digest, allRecords ] of digestMap) {
    if (allRecords.length <= 1) {
      continue;
    }
    const records = allRecords.
      map(record => {
        const [ type, testPath ] = record.split(':');
        const btime = utility.getTimestamp(fs.lstatSync(testPath).birthtimeMs);
        return `${type}:${btime}:${testPath}`;
      }).
      sort();
    if (records.every(record => record.startsWith('0'))) {
      records.splice(0, 1);
    }
    const digitCount = (records.length - 1).toString().length;
    let sli = 0, fi = 0;
    const pairs = records.map(record => {
      const [ type, btime, testPath ] = record.split(':');
      const i = (type === '0') ? (sli++) : (fi++);
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
        if (/^10+_/.test(newName)) {
          fs.symlinkSync(testPath, newPath);
        } else {
          fs.renameSync(testPath, newPath);
        }
      }
      const omittedNew = utility.omitPath(newPath, execIdDpath);
      const omittedOld = utility.omitPath(testPath, targetDpath);
      info['Records'].push(`${omittedNew}:${omittedOld}`);
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
