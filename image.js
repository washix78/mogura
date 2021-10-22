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
  execId += (
    (sign === undefined || sign === null || sign === '') ? path.basename(targetDpath) : sign
  );

  const isForced = options.includes('-F');
  info['Forced'] = isForced;

  const execIdDpath = path.resolve('./extra', execId);
  info['Extra directory'] = (isForced) ? execIdDpath : null;

  info['Target symbolic link count'] = utility.getSymbolicLinkPaths(targetDpath).length;

  const extMap = new Map();
  [ 'BMP', 'GIF', 'JPG', 'PNG', 'binary.d', 'syml.d' ].forEach(ext => extMap.set(ext, []));
  const getExt = (testPath) => {
    const fd = fs.openSync(testPath);
    try {
      const buf = Buffer.alloc(10);
      fs.readSync(fd, buf, 0, buf.length, 0);

      const bmpHeader = Buffer.from([ 0x42, 0x4d ]);
      if (bmpHeader.equals(buf.subarray(0, bmpHeader.length))) {
        return 'BMP';
      }
      const jpgHeader = Buffer.from([ 0xff, 0xd8 ]);
      if (jpgHeader.equals(buf.subarray(0, jpgHeader.length))) {
        return 'JPG';
      }
      const gifHeader1 = Buffer.from([ 0x47, 0x49, 0x46, 0x38, 0x37, 0x61 ]);
      if (gifHeader1.equals(buf.subarray(0, gifHeader1.length))) {
        return 'GIF';
      }
      const gitHeader2 = Buffer.from([ 0x47, 0x49, 0x46, 0x38, 0x39, 0x61 ]);
      if (gitHeader2.equals(buf.subarray(0, gitHeader2.length))) {
        return 'GIF';
      }
      const pngHeader = Buffer.from([ 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A ]);
      if (pngHeader.equals(buf.subarray(0, pngHeader.length))) {
        return 'PNG';
      }
      return 'binary.d';
    } finally {
      fs.closeSync(fd);
    }
  };
  const fpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = fpaths.length;
  for (let i = 0; i < fpaths.length; i++) {
    const testPath = fpaths[i];
    const ext = getExt(testPath);
    const record = `1:${testPath}`;
    extMap.get(ext).push(record);
  }
  const slpaths = utility.getSymbolicLinkPaths(targetDpath);
  info['Target symbolic link count'] = slpaths.length;
  for (let i = 0; i < slpaths.length; i++) {
    const record = `0:${slpaths[i]}`;
    extMap.get('syml.d').push(record);
  }

  if (isForced) {
    fs.mkdirSync(execIdDpath);
  }
  for (const [ ext, records ] of extMap) {
    const digitCount = (records.length - 1).toString().length;
    let sli = 0, fi = 0;
    const pairs = records.
      map(record => {
        const [ type, testPath ] = record.split(':');
        const btime = utility.getTimestamp(fs.lstatSync(testPath).birthtimeMs);
        return `${type}:${btime}:${testPath}`;
      }).
      sort().
      map((record) => {
        const [ type, btime, testPath ] = record.split(':');
        const i = (type === '0') ? sli++ : fi++;
        const no = i.toString().padStart(digitCount, '0');
        const newName = (ext === 'binary.d' || ext === 'syml.d') ?
          utility.getFormattedName(path.basename(testPath), `${type}${no}`, btime) :
          utility.getFormattedNameWithExtension(path.basename(testPath), `${type}${no}`, btime, ext.toLowerCase());
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
