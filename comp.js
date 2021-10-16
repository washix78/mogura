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
  execId = (sign === undefined || sign === null || sign === '') ?
    `${timestamp}_comp` : `${timestamp}_comp_${sign}`;

  const execIdDpath = path.resolve('./extra', `${execId}`);
  if (fs.existsSync(execIdDpath)) {
    throw new Error(`Sorry, can not create. "${execIdDpath}"`);
  }
  info['Extra directory'] = isForced ? execIdDpath : null;

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
    const record = `01:${testPath}`;
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
      const record = `11:${testPath}`;
      digestMap.get(digest).push(record);
    }
  }

  const baseSlpaths = utility.getSymbolicLinkPaths(baseDpath);
  info['Base symbolic link count'] = baseSlpaths.length;
  for (let i = 0; i < baseSlpaths.length; i++) {
    const testPath = baseSlpaths[i];
    const digest1 = await utility.getFileDigest(testPath, 'md5');
    const digest2 = await utility.getFileDigest(testPath, 'sha1');
    const digest = `${digest1}_${digest2}`;
    if (!digestMap.has(digest)) {
      const record = `00:${testPath}`;
      digestMap.set(digest, [ record ]);
    }
  }

  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath);
  info['Target symbolic link count'] = targetSlpaths.length;
  for (let i = 0; i < targetSlpaths.length; i++) {
    const testPath = targetSlpaths[i];
    const digest1 = await utility.getFileDigest(testPath, 'md5');
    const digest2 = await utility.getFileDigest(testPath, 'sha1');
    const digest = `${digest1}_${digest2}`;
    if (digestMap.has(digest)) {
      const record = `10:${testPath}`;
      digestMap.get(digest).push(record);
    }
  }

  if (isForced) {
    fs.mkdirSync(execIdDpath);
  }

  for (const [ digest, allRecords ] of digestMap) {
    if (allRecords.every(record => record.startsWith('0'))) {
      continue;
    }
    const records = allRecords.map(record => {
      const [ type, testPath ] = record.split(':');
      const btime = utility.getTimestamp(fs.lstatSync(testPath).birthtimeMs);
      return `${type}:${btime}:${testPath}`;
    }).
    sort().
    filter((record, i) => {
      return record.startsWith('1') ||
        (record.startsWith('01') && i === 0);
    });
    const digitCount = (records.length - 1).toString().length;
    let bfi = 0, tsli = 0, tfi = 0;
    const pairs = records.map(record => {
      const [ type, btime, testPath ] = record.split(':');
      const i = (type === '01') ? bfi++ :
        (type === '10') ? tsli++ :
        tfi++;
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
        if (newName.startsWith('01')) {
          fs.symlinkSync(testPath, newPath);
        } else {
          fs.renameSync(testPath, newPath);
        }
      }
      const omittedNew = utility.omitPath(newPath, execIdDpath);
      const parentDpath = newName.startsWith('0') ? baseDpath : targetDpath;
      const omittedOld = utility.omitPath(testPath, parentDpath);
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
