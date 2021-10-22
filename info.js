const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);
let execId = `${timestamp}_info_`;
const info = {
  'Target directory': null,
  'Target file count': null,
  'Target symbolic link count': null,
  'File extensions': {},
  'Symbolic link extensions': {},
  'Time': -1,
};

const main = async () => {
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
  }
  if (!fs.existsSync('./extra')) {
    fs.mkdirSync('./extra');
  }

  // node info ${dir_path} -s ${sign}
  const [ , , testTargetDpath, ...options ] = process.argv;

  const targetDpath = path.resolve(testTargetDpath);
  if (!fs.existsSync(targetDpath) || !fs.lstatSync(targetDpath).isDirectory()) {
    throw new Error(`Not directory. "${targetDpath}"`);
  }
  info['Target directory'] = targetDpath;

  const sign = utility.getOptionValue('-s', options);
  execId += (sign !== undefined && sign !== null && sign !== '') ?
    sign : path.basename(targetDpath).toUpperCase();

  const allFpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = allFpaths.length;
  const fileExtMap = new Map();
  for (const fpath of allFpaths) {
    const fname = path.basename(fpath);
    const ext = utility.getExtension(fname);
    const key = (ext === undefined || ext === null) ? 'ext_none.d' :
      (ext === '') ? 'ext_zero.d' :
      ext.toUpperCase();

    if (!fileExtMap.has(key)) {
      fileExtMap.set(key, 0);
    }
    const count = fileExtMap.get(key) + 1;
    fileExtMap.set(key, count);
  }
  Array.from(fileExtMap.keys()).sort().forEach(key => info['File extensions'][key] = fileExtMap.get(key));

  const allSLpaths = utility.getSymbolicLinkPaths(targetDpath);
  info['Target symbolic link count'] = allSLpaths.length;
  const slExtMap = new Map();
  for (const fpath of allSLpaths) {
    const fname = path.basename(fpath);
    const ext = utility.getExtension(fname);
    const key = (ext === undefined || ext === null) ? 'ext_none.d' :
      (ext === '') ? 'ext_zero.d' :
      ext.toUpperCase();

    if (!slExtMap.has(key)) {
      slExtMap.set(key, 0);
    }
    const count = slExtMap.get(key) + 1;
    slExtMap.set(key, count);
  }
  Array.from(slExtMap.keys()).sort().forEach(key => info['Symbolic link extensions'][key] = slExtMap.get(key));

  info['Time'] = Date.now() - startTime;
};

main().
catch(e => console.error(e.stack)).
finally(() => {
  info['Time'] = Date.now() - startTime;
  const logFpath = path.resolve('./logs', `${execId}.json`);
  fs.writeFileSync(logFpath, JSON.stringify(info, null, 2));
  console.log(`End. ${Date.now() - startTime}`);
});
