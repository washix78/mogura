const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);
let execId = `${timestamp}_supply_`;
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

  // node supply ${dir_path} ${dir_path} -s ${sign} ${-F} -dp ${dir_path}
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

  const testDestinationDpath = utility.getOptionValue('-dp', options);
  const extraDpath = (
    testDestinationDpath === undefined ||
    testDestinationDpath === null ||
    testDestinationDpath.length === 0
  ) ? path.resolve('./extra', `${execId}`) : path.resolve(testDestinationDpath);

  if (fs.existsSync(extraDpath)) {
    if (!fs.lstatSync(extraDpath).isDirectory() || 0 < fs.readdirSync(extraDpath).length) {
      throw new Error(`Can not create. "${extraDpath}"`);
    }
  } else {
    if (isForced) {
      fs.mkdirSync(extraDpath);
    }
  }
  info['Extra directory'] = isForced ? extraDpath : null;

  const digestSet = new Set();
  const baseFpaths = utility.getFilePaths(baseDpath);
  info['Base file count'] = baseFpaths.length;
  for (let i = 0; i < baseFpaths.length; i++) {
    const testPath = baseFpaths[i];
    const digest1 = await utility.getFileDigest(testPath, 'md5');
    const digest2 = await utility.getFileDigest(testPath, 'sha1');
    const digest = `${digest1}_${digest2}`;
    digestSet.add(digest);
  }

  const omittedFpaths = [];

  const targetFpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = targetFpaths.length;
  for (let i = 0; i < targetFpaths.length; i++) {
    const testPath = targetFpaths[i];
    const digest1 = await utility.getFileDigest(testPath, 'md5');
    const digest2 = await utility.getFileDigest(testPath, 'sha1');
    const digest = `${digest1}_${digest2}`;
    if (!digestSet.has(digest)) {
      const omittedFpath = utility.omitPath(testPath, targetDpath);
      omittedFpaths.push(omittedFpath);
    }
  }

  for (let i = 0; i < omittedFpaths.length; i++) {
    const omittedFpath = omittedFpaths[i];
    const oldFpath = path.resolve(targetDpath, omittedFpath);
    const newFpath = path.resolve(extraDpath, omittedFpath);
    if (isForced) {
      const parentDpath = path.dirname(newFpath);
      fs.mkdirSync(parentDpath, { recursive: true });
      fs.copyFileSync(oldFpath, newFpath);
    }
    info['Records'].push(omittedFpath);
  }

  const baseSlpaths = utility.getSymbolicLinkPaths(baseDpath);
  info['Base symbolic link count'] = baseSlpaths.length;

  const targetSlpaths = utility.getSymbolicLinkPaths(targetDpath);
  info['Target symbolic link count'] = targetSlpaths.length;
};

main().
catch(e => console.error(e.stack)).
finally(() => {
  info['Time'] = Date.now() - startTime;
  const logFpath = path.resolve('./logs', `${execId}.json`);
  fs.writeFileSync(logFpath, JSON.stringify(info, null, 2));
  console.log(`End. Time: ${Date.now() - startTime}`);
});
