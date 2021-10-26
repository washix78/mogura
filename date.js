const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);
let execId = `${timestamp}_date_`;
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

  // node date ${dir_path} -d ${ymd} -s ${sign} ${-F}
  const [ , , testTargetDpath, ...options ] = process.argv;

  const targetDpath = path.resolve(testTargetDpath);
  if (!fs.existsSync(targetDpath) || !fs.lstatSync(targetDpath).isDirectory()) {
    throw new Error(`Not directory. "${targetDpath}"`);
  }
  info['Target directory'] = targetDpath;

  const ymdType = utility.getOptionValue('-d', options);
  if (![ 'y', 'ym', 'ymd' ].includes(ymdType)) {
    throw new Error(`Invalid option "-d ${ymdType}".`);
  }

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

  const ymdMap = new Map();
  const fpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = fpaths.length;
  for (let i = 0; i < fpaths.length; i++) {
    const testPath = fpaths[i];
    const btime = utility.getTimestamp(fs.lstatSync(testPath).birthtimeMs);
    const y = btime.substring(0, 4);
    const m = btime.substring(4, 6);
    const d = btime.substring(6, 8);
    const ymd = (ymdType === 'y') ? `${y}` :
      (ymdType === 'ym') ? `${y}-${m}` :
      `${y}-${m}-${d}`;
    if (!ymdMap.has(ymd)) {
      ymdMap.set(ymd, []);
    }
    const record = `${btime}:${testPath}`;
    ymdMap.get(ymd).push(record);
  }

  const slpaths = utility.getSymbolicLinkPaths(targetDpath);
  info['Target symbolic link count'] = slpaths.length;

  const ymdList = Array.from(ymdMap.keys()).sort();
  for (let li = 0; li < ymdList.length; li++) {
    const ymd = ymdList[li];
    const records = ymdMap.get(ymd).sort();
    const digitCount = (records.length - 1).toString().length;
    const pairs = records.map((record, i) => {
      const [ btime, testPath ] = record.split(':');
      const no = i.toString().padStart(digitCount, '0');
      const newName = utility.getFormattedName(path.basename(testPath), no, btime);
      return [ newName, testPath ];
    });

    const ymdDpath = path.resolve(execIdDpath, ymd);
    if (isForced) {
      fs.mkdirSync(ymdDpath);
    }
    for (let i = 0; i < pairs.length; i++) {
      const [ newName, testPath ] = pairs[i];
      const newPath = path.resolve(ymdDpath, newName);
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

  for (const ymd of ymdMap.keys()) {
    const oldPath = path.resolve(execIdDpath, ymd);
    const newPath = path.resolve(targetDpath, ymd);
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
