const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports.generateResourceFiles = (baseDpath, lines) => {
  lines.forEach(line => {
    const [ src, dist ] = line.split(':');
    const srcPath = path.resolve(process.cwd(), 'test/resources', src);
    const distPath = path.resolve(baseDpath, dist);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.copyFileSync(srcPath, distPath);
  });
};

module.exports.generateResourceSymbolicLinks = (baseDpath, lines) => {
  lines.forEach(line => {
    const [ src, dist ] = line.split(':');
    const srcPath = path.resolve(process.cwd(), 'test/resources', src);
    const distPath = path.resolve(baseDpath, dist);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.symlinkSync(srcPath, distPath);
  });
};

module.exports.getAllPaths = (targetDpath) => {
  const allPaths = [];
  const walk = (parentDpath) => {
    const direntList = fs.readdirSync(parentDpath, { withFileTypes: true });

    const paths = direntList.
      map(dirent => dirent.name).
      sort().
      map(name => path.resolve(parentDpath, name));
    Array.prototype.push.apply(allPaths, paths);

    const dpaths = direntList.
      filter(dirent => dirent.isDirectory()).
      map(dirent => dirent.name).
      sort().
      map(name => path.resolve(parentDpath, name));
    dpaths.forEach(dpath => walk(dpath));
  };
  walk(targetDpath);
  return allPaths;
};

module.exports.getDirectoryPaths = (targetDpath) => {
  const allPaths = [];
  const walk = (parentDpath) => {
    const dpaths = fs.readdirSync(parentDpath, { withFileTypes: true }).
      filter(dirent => dirent.isDirectory()).
      map(dirent => dirent.name).
      sort().
      map(name => path.resolve(parentDpath, name));
    Array.prototype.push.apply(allPaths, dpaths);
    dpaths.forEach(dpath => walk(dpath));
  };
  walk(targetDpath);
  return allPaths;
};

module.exports.getFilePaths = (targetDpath) => {
  const allPaths = [];
  const walk = (parentDpath) => {
    const direntList = fs.readdirSync(parentDpath, { withFileTypes: true });

    const fpaths = direntList.
      filter(dirent => dirent.isFile()).
      map(dirent => dirent.name).
      sort().
      map(name => path.resolve(parentDpath, name));
    Array.prototype.push.apply(allPaths, fpaths);

    const dpaths = direntList.
      filter(dirent => dirent.isDirectory()).
      map(dirent => dirent.name).
      sort().
      map(name => path.resolve(parentDpath, name));
    dpaths.forEach(dpath => walk(dpath));
  };
  walk(targetDpath);
  return allPaths;
};

module.exports.getSymbolicLinkPaths = (targetDpath) => {
  const allPaths = [];
  const walk = (parentDpath) => {
    const direntList = fs.readdirSync(parentDpath, { withFileTypes: true });

    const slpaths = direntList.
      filter(dirent => dirent.isSymbolicLink()).
      map(dirent => dirent.name).
      sort().
      map(name => path.resolve(parentDpath, name));
    Array.prototype.push.apply(allPaths, slpaths);

    const dpaths = direntList.
      filter(dirent => dirent.isDirectory()).
      map(dirent => dirent.name).
      sort().
      map(name => path.resolve(parentDpath, name));
    dpaths.forEach(dpath => walk(dpath));
  };
  walk(targetDpath);
  return allPaths;
};

module.exports.getExtension = (src) => {
  if (src === null || src === undefined) {
    return null;
  }

  const dotI = src.lastIndexOf('.');
  if (dotI < 0) {
    return null;
  }

  if (dotI + 1 === src.length) {
    return '';
  }

  return src.substring(dotI + 1);
};

module.exports.getFileDigest = (fpath, algorithm) => {
  return new Promise((resolve, _) => {
    const hash = crypto.createHash(algorithm);
    fs.createReadStream(fpath).
      on('data', chunk => hash.update(chunk)).
      on('close', () => resolve(hash.digest('hex')));
  });
};

module.exports.getFileWriter = (fpath) => {
  return new class {
    constructor(fpath) {
      this.ws = fs.createWriteStream(fpath).
        on('error', (err) => { throw err });
    }

    write(lines) {
      if (Array.isArray(lines)) {
        lines.forEach(line => {
          this.ws.write(line);
          this.ws.write(os.EOL);
        });
      } else {
        this.ws.write(lines);
        this.ws.write(os.EOL);
      }
    }

    end() {
      return new Promise((resolve, _) => {
        this.ws.on('close', () => resolve());
        this.ws.end();
        this.ws.close();
      });
    }
  }(fpath);
};

module.exports.getFormattedName = (name, no, btime) => {
  const prefix = `${no}_${btime}-`;
  const newName = /^\d+_\d{17}\-/.test(name) ?
    name.replace(/^\d+_\d{17}\-/, prefix) : `${prefix}${name}`;
  if (255 <= newName.length) {
    throw new Error(`New file name is too long. "${newName}"`);
  }
  return newName;
};

module.exports.getFormattedNameWithExtension = (name, no, btime, ext) => {
  let newName = name.replace(/^(?:\d+_\d{17}\-)?(?<subName>.*)$/, (_, subName) => subName);
  const extI = newName.lastIndexOf('.');
  if (0 <= extI) {
    newName = newName.substring(0, extI);
  }
  newName = `${no}_${btime}-${newName}.${ext}`;
  if (255 <= newName.length) {
    throw new Error(`New file name is too long. "${newName}"`);
  }
  return newName;
};

module.exports.getImageType = (testPath) => {
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

module.exports.getLatestDpath = (targetDpath, timestamp, suffix) => {
  const dnames = fs.readdirSync(targetDpath, { withFileTypes: true }).
    filter(dirent => dirent.isDirectory()).
    map(dirent => dirent.name).
    filter(name => /^[0-9]{17}_/.test(name) && name.substring(18) === suffix).
    sort((a, b) => -(a.localeCompare(b)));

  if (timestamp <= dnames[0]) {
    return path.resolve(targetDpath, dnames[0]);
  } else {
    return null;
  }
};

module.exports.getLatestFpath = (targetDpath, timestamp, suffix) => {
  const fnames = fs.readdirSync(targetDpath, { withFileTypes: true }).
    filter(dirent => dirent.isFile()).
    map(dirent => dirent.name).
    filter(name => /^[0-9]{17}_/.test(name) && name.substring(18) === suffix).
    sort((a, b) => -(a.localeCompare(b)));

  if (timestamp <= fnames[0]) {
    return path.resolve(targetDpath, fnames[0]);
  } else {
    return null;
  }
};

module.exports.getOptionValue = (type, values) => {
  const i = values.findIndex(val => val === type);
  if (0 <= i + 1 && i + 1 < values.length) {
    const value = values[i + 1];
    if (!value.startsWith('-')) {
      return value;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports.getOptionValues = (type, values) => {
  const i = values.findIndex(val => val === type);
  if (i === -1) {
    return null;
  } else {
    let optValues = [];
    for (let vi = i + 1; vi < values.length; vi++) {
      if (!values[vi].startsWith('-')) {
        optValues.push(values[vi]);
      }
    }
    return optValues;
  }
};

module.exports.getTimestamp = (src) => {
  if (src !== undefined && src !== null && typeof src !== 'number') {
    throw new Error(`Invalid value`);
  }

  const date = (src === undefined || src === null) ? new Date() : new Date(src);

  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, 0);
  const d = date.getDate().toString().padStart(2, 0);
  const h = date.getHours().toString().padStart(2, 0);
  const min = date.getMinutes().toString().padStart(2, 0);
  const s = date.getSeconds().toString().padStart(2, 0);
  const ms = date.getMilliseconds().toString().padStart(3, 0);
  const timestamp = `${y}${m}${d}${h}${min}${s}${ms}`;
  return timestamp;
};

module.exports.omitPath = (full, part) => {
  return full.substring(part.length + 1);
};
