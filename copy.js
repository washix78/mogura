const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const startTime = Date.now();
const timestamp = utility.getTimestamp(startTime);
let execId = `${timestamp}_copy_`;
const info = {
  'Target directory': null,
  'Target file count': null,
  'Target symbolic link count': null,
  'Forced': null,
  'Destination directory': null,
  'Filter type': null,
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

  // node copy ${dir_path} -s ${sign} ${-F} -e ${extension} -i ${image extension}
  const [ , , testTargetDpath, testDestinationDpath, ...options ] = process.argv;

  const isForced = options.includes('-F');
  info['Forced'] = isForced;

  const targetDpath = path.resolve(testTargetDpath);
  if (!fs.existsSync(targetDpath) || !fs.lstatSync(targetDpath).isDirectory()) {
    throw new Error(`Not directory. "${targetDpath}"`);
  }
  info['Target directory'] = targetDpath;

  const destinationDpath = path.resolve(testDestinationDpath);
  if (fs.existsSync(destinationDpath)) {
    if (!fs.lstatSync(destinationDpath).isDirectory()) {
      throw new Error(`Not directory. "${destinationDpath}"`);
    }
    if (0 < fs.readdirSync(destinationDpath).length) {
      throw new Error(`Directory is not empty.`);
    }
  }
  info['Destination directory'] = (isForced) ? destinationDpath : null;

  const sign = utility.getOptionValue('-s', options);
  execId += (sign !== undefined && sign !== null && sign !== '') ?
    sign : path.basename(targetDpath).toUpperCase();

  const execIdDpath = path.resolve('./extra', `${execId}`);
  if (fs.existsSync(execIdDpath)) {
    throw new Error(`Sorry, can not create. "${execIdDpath}"`);
  }

  const allFpaths = utility.getFilePaths(targetDpath);
  info['Target file count'] = allFpaths.length;
  info['Target symbolic link count'] = utility.getSymbolicLinkPaths(targetDpath).length;

  const filterByExt = (testExtType) => {
    if (testExtType === undefined || testExtType === null) {
      return allFpaths;
    }
    const extType = testExtType.toLowerCase();
    if (extType === 'ext_none.d') {
      info['Filter type'] = `extension:ext_none.d`;
      return allFpaths.filter(testPath => {
        const ext = utility.getExtension(path.basename(testPath));
        return (ext === undefined || ext === null);
      });
    } else if (extType === 'ext_zero.d' || extType === '') {
      info['Filter type'] = `extension:ext_zero.d`;
      return allFpaths.filter(testPath => {
        const ext = utility.getExtension(path.basename(testPath));
        return (ext === '');
      });
    } else {
      info['Filter type'] = `extension:${extType}`;
      return allFpaths.filter(testPath => {
        const ext = utility.getExtension(path.basename(testPath));
        return (ext !== undefined && ext !== null && ext.toLowerCase() === extType);
      });
    }
  };

  const filterByImg = (testImgType) => {
    if (testImgType === undefined || testImgType === null) {
      return allFpaths;
    }
    const imgType = testImgType.toLowerCase();
    if (![ 'bmp', 'gif', 'jpg', 'png' ].includes(imgType)) {
      return allFpaths;
    }
    info['Filter type'] = `image:${imgType}`;
    return allFpaths.filter(testPath => {
      const img = utility.getImageType(testPath);
      return (img.toLowerCase() === imgType);
    });
  };

  const extFilterValue = utility.getOptionValue('-e', options);
  const imgFilterValue = utility.getOptionValue('-i', options);

  let fpaths = allFpaths;
  if (
    options.includes('-e') &&
    extFilterValue !== undefined &&
    extFilterValue !== null
  ) {
    fpaths = filterByExt(extFilterValue);
  } else if (
    options.includes('-i') &&
    imgFilterValue !== undefined &&
    imgFilterValue !== null &&
    [ 'bmp', 'gif', 'jpg', 'png' ].includes(imgFilterValue.toLowerCase())
  ) {
    fpaths = filterByImg(imgFilterValue);
  }

  for (let i = 0; i < fpaths.length; i++) {
    const testPath = fpaths[i];
    if (isForced) {

    }
    const omitted = utility.omitPath(testPath, targetDpath);
    const newPath = path.resolve(destinationDpath, omitted);
    const parentDpath = path.dirname(newPath);

    if (isForced) {
      if (!fs.existsSync(parentDpath)) {
        fs.mkdirSync(parentDpath, { recursive: true });
      }
      fs.copyFileSync(testPath, newPath);
    }
    const omittedNew = utility.omitPath(newPath, destinationDpath);
    const omittedOld = utility.omitPath(testPath, targetDpath);
    info['Records'].push(`${omittedNew}:${omittedOld}`);
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
